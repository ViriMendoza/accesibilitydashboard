import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// Usa Chrome instalado en el sistema; si no existe, el Chromium de Playwright
// (requiere `npx playwright install chromium`).
async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' })
  } catch {
    return await chromium.launch()
  }
}

// "wcag1411" -> "1.4.11": principio y pauta son de un dígito, el resto es el criterio.
function tagsToCriteria(tags) {
  return tags
    .map((t) => /^wcag(\d)(\d)(\d+)$/.exec(t))
    .filter(Boolean)
    .map(([, p, g, c]) => `${p}.${g}.${c}`)
}

function summarize(results) {
  const toRule = (r) => ({
    id: r.id,
    impact: r.impact,
    help: r.help,
    helpUrl: r.helpUrl,
    criteria: tagsToCriteria(r.tags),
    count: r.nodes.length,
    targets: r.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  })
  return {
    violations: results.violations.map(toRule),
    passes: results.passes.map(toRule),
    incomplete: results.incomplete.length,
  }
}

export async function scan({ url, html }) {
  const browser = await launch()
  try {
    const page = await (await browser.newContext()).newPage()
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    } else {
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 })
    }
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
    return { title: await page.title(), ...summarize(results) }
  } finally {
    await browser.close()
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 2_000_000) reject(new Error('El HTML excede 2 MB'))
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

// Middleware compatible con el servidor de Vite (connect).
export async function scanMiddleware(req, res) {
  const send = (status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }
  if (req.method !== 'POST') return send(405, { error: 'Método no permitido' })

  try {
    const { url, html } = JSON.parse(await readBody(req))
    if (url && !/^https?:\/\//i.test(url)) return send(400, { error: 'La URL debe empezar con http:// o https://' })
    if (!url && !html) return send(400, { error: 'Indica una URL o pega HTML' })
    send(200, await scan({ url, html }))
  } catch (err) {
    send(500, { error: err.message })
  }
}
