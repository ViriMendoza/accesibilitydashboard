import { useState } from 'react'
import { CRITERIA, criteriaFor } from '../data/criteria'

const IMPACT = {
  critical: { label: 'Crítico', order: 0 },
  serious: { label: 'Grave', order: 1 },
  moderate: { label: 'Moderado', order: 2 },
  minor: { label: 'Menor', order: 3 },
}

const MAX_SCANS = 50

export default function Scanner({ project, onUpdate, announce }) {
  const [mode, setMode] = useState('url')
  const [url, setUrl] = useState(project.url ?? '')
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scan = project.scans?.[0]

  async function runScan(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    announce('Escaneando, esto puede tardar unos segundos')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'url' ? { url: url.trim() } : { html }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const entry = {
        date: new Date().toISOString(),
        source: mode === 'url' ? url.trim() : 'HTML pegado',
        ...data,
        violations: [...data.violations].sort((a, b) => IMPACT[a.impact].order - IMPACT[b.impact].order),
      }
      onUpdate({
        ...project,
        url: mode === 'url' ? url.trim() : project.url,
        scans: [entry, ...(project.scans ?? [])].slice(0, MAX_SCANS),
      })
      announce(`Escaneo completo: ${entry.violations.length} reglas con errores`)
    } catch (err) {
      const message = err.message || 'No se pudo completar el escaneo'
      setError(message)
      announce(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  // Violaciones -> "No cumple". Criterios sin errores y con pruebas aprobadas -> "Cumple",
  // solo si seguían pendientes: nunca se sobrescribe una revisión manual.
  function applyToChecklist() {
    const applicable = new Set(criteriaFor(project).map((c) => c.id))
    const failed = new Set(scan.violations.flatMap((v) => v.criteria).filter((id) => applicable.has(id)))
    const passed = new Set(scan.passes.flatMap((v) => v.criteria).filter((id) => applicable.has(id) && !failed.has(id)))
    const checks = { ...project.checks }
    let fails = 0
    let passes = 0
    failed.forEach((id) => {
      if (checks[id] !== 'na' && checks[id] !== 'fail') {
        checks[id] = 'fail'
        fails++
      }
    })
    passed.forEach((id) => {
      if ((checks[id] ?? 'pending') === 'pending') {
        checks[id] = 'pass'
        passes++
      }
    })
    onUpdate({ ...project, checks })
    announce(`Checklist actualizado: ${fails} marcados como no cumple, ${passes} como cumple`)
  }

  const affected = scan
    ? [...new Set(scan.violations.flatMap((v) => v.criteria))].filter((id) => CRITERIA.some((c) => c.id === id))
    : []

  return (
    <section className="card scanner" aria-labelledby="h-scan" aria-busy={loading}>
      <div className="scanner-head">
        <div>
          <h2 id="h-scan">Escaneo automático</h2>
          <p className="muted small">
            axe-core detecta alrededor del 30–40 % de los problemas. El resto requiere revisión manual.
          </p>
        </div>
        <div className="segmented" role="group" aria-label="Origen del escaneo">
          <button type="button" aria-pressed={mode === 'url'} onClick={() => setMode('url')}>
            URL
          </button>
          <button type="button" aria-pressed={mode === 'html'} onClick={() => setMode('html')}>
            Pegar HTML
          </button>
        </div>
      </div>

      <form className="scan-form" onSubmit={runScan}>
        {mode === 'url' ? (
          <label className="field scan-input">
            <span>URL a escanear</span>
            <input
              type="url"
              required
              placeholder="https://ejemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
        ) : (
          <label className="field scan-input">
            <span>Código HTML</span>
            <textarea
              required
              rows={6}
              className="mono"
              placeholder="<!doctype html>…"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </label>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Escaneando…' : 'Escanear'}
        </button>
      </form>

      {loading && <div className="scan-progress" aria-hidden="true" />}
      {error && (
        <p className="scan-error" role="alert">
          {error}
        </p>
      )}

      {scan && !loading && (
        <div className="scan-results">
          <div className="scan-summary">
            <div>
              <span className="muted small">
                Último escaneo · {new Date(scan.date).toLocaleString('es-MX')} · {scan.source}
              </span>
              <p>
                <strong>{scan.violations.length}</strong> reglas con errores ·{' '}
                <strong>{scan.passes.length}</strong> aprobadas · <strong>{scan.incomplete}</strong> por revisar a mano
              </p>
              {affected.length > 0 && (
                <p className="muted small">Criterios afectados: {affected.join(', ')}</p>
              )}
            </div>
            <button type="button" className="btn" onClick={applyToChecklist}>
              Aplicar al checklist
            </button>
          </div>

          {scan.violations.length === 0 ? (
            <p className="muted">Sin errores automáticos detectados. Continúa con la revisión manual.</p>
          ) : (
            <ul className="violations">
              {scan.violations.map((v, i) => (
                <li key={v.id} className="violation" style={{ '--i': i }}>
                  <span className={`impact impact-${v.impact}`}>{IMPACT[v.impact].label}</span>
                  <div className="violation-body">
                    <span className="violation-title">{v.help}</span>
                    <span className="muted small">
                      <span className="mono">{v.id}</span>
                      {v.criteria.length > 0 && <> · WCAG {v.criteria.join(', ')}</>} · {v.count}{' '}
                      {v.count === 1 ? 'elemento' : 'elementos'}
                    </span>
                    {v.targets.length > 0 && <code className="violation-target">{v.targets[0]}</code>}
                  </div>
                  <a href={v.helpUrl} target="_blank" rel="noreferrer" className="small">
                    Cómo corregirlo<span className="visually-hidden"> (abre en otra pestaña)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
