import { useState } from 'react'
import { criteriaFor } from '../data/criteria'
import { MONTHS, formatDate, today } from '../utils/date'
import { downloadFile, toCsv } from '../utils/download'
import HistoryChart from './HistoryChart'
import { AnimatedNumber } from './ProgressBar'

const MAX_SERIES = 8

export default function History({ projects }) {
  const [projectId, setProjectId] = useState('all')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')

  const years = [
    ...new Set(
      projects.flatMap((p) => [...p.history.map((h) => h.date), ...(p.scans ?? []).map((s) => s.date)]).map((d) => d.slice(0, 4)),
    ),
  ].sort((a, b) => b.localeCompare(a))

  const inPeriod = (date) =>
    (year === 'all' || date.startsWith(year)) && (month === 'all' || Number(date.slice(5, 7)) - 1 === Number(month))

  // El color sigue al proyecto (su posición en la lista completa), no al filtro.
  const selected = projects
    .map((p, i) => ({ project: p, slot: (i % MAX_SERIES) + 1 }))
    .filter(({ project }) => projectId === 'all' || project.id === projectId)
  const charted = selected.slice(0, MAX_SERIES)

  const series = charted.map(({ project, slot }) => ({
    id: project.id,
    name: project.name,
    slot,
    points: [...project.history].sort((a, b) => a.date.localeCompare(b.date)).filter((h) => inPeriod(h.date)),
  }))

  const events = selected
    .flatMap(({ project }) => [
      ...project.history.filter((h) => inPeriod(h.date)).map((h) => ({ type: 'evaluation', project, ...h })),
      ...(project.scans ?? [])
        .filter((s) => inPeriod(s.date.slice(0, 10)))
        .map((s) => ({ type: 'scan', project, date: s.date.slice(0, 10), scan: s })),
    ])
    .sort((a, b) => b.date.localeCompare(a.date))

  const withData = series.filter((s) => s.points.length > 0)
  const closing = withData.length
    ? Math.round(withData.reduce((sum, s) => sum + s.points[s.points.length - 1].score, 0) / withData.length)
    : 0
  const change = withData.length
    ? Math.round(
        withData.reduce((sum, s) => sum + s.points[s.points.length - 1].score - s.points[0].score, 0) / withData.length,
      )
    : 0
  const scanCount = events.filter((e) => e.type === 'scan').length

  const periodLabel =
    year === 'all' ? 'Todo el historial' : month === 'all' ? `Año ${year}` : `${MONTHS[month]} ${year}`
  const projectLabel = projectId === 'all' ? 'Todos los proyectos' : projects.find((p) => p.id === projectId).name
  const fileBase = `historial-a11y-${year === 'all' ? 'completo' : year}${month === 'all' ? '' : `-${String(Number(month) + 1).padStart(2, '0')}`}`

  // Incumplimientos abiertos hoy, con responsable y fecha, para el reporte.
  const openIssues = selected.flatMap(({ project }) =>
    criteriaFor(project)
      .filter((c) => project.checks[c.id] === 'fail')
      .map((c) => ({ project, criterion: c, ...project.issues[c.id] })),
  )

  function downloadCsv() {
    const rows = [
      ['Fecha', 'Proyecto', 'Tipo', 'Puntuación', 'Cumple', 'No cumple', 'Pendiente', 'Reglas con errores (axe)', 'Origen del escaneo'],
      ...events.map((e) =>
        e.type === 'evaluation'
          ? [e.date, e.project.name, 'Evaluación', e.score, e.pass, e.fail, e.pending, '', '']
          : [e.date, e.project.name, 'Escaneo', '', '', '', '', e.scan.violations.length, e.scan.source],
      ),
    ]
    downloadFile(`${fileBase}.csv`, toCsv(rows), 'text/csv;charset=utf-8')
  }

  function downloadMarkdown() {
    const lines = [
      `# Reporte de historial de accesibilidad`,
      '',
      `- **Periodo:** ${periodLabel}`,
      `- **Proyectos:** ${projectLabel}`,
      `- **Generado:** ${formatDate(today())}`,
      '',
      '## Resumen del periodo',
      '',
      `- Puntuación promedio al cierre: ${closing}/100`,
      `- Cambio promedio en el periodo: ${change >= 0 ? '+' : ''}${change} puntos`,
      `- Escaneos automáticos: ${scanCount}`,
      '',
      '## Por proyecto',
      '',
      '| Proyecto | Inicio | Cierre | Cambio | Registros |',
      '| --- | --- | --- | --- | --- |',
      ...series.map((s) => {
        if (!s.points.length) return `| ${s.name} | — | — | — | 0 |`
        const first = s.points[0].score
        const last = s.points[s.points.length - 1].score
        return `| ${s.name} | ${first} | ${last} | ${last - first >= 0 ? '+' : ''}${last - first} | ${s.points.length} |`
      }),
      '',
      '## Incumplimientos abiertos (al día de hoy)',
      '',
      ...(openIssues.length
        ? [
            '| Proyecto | Criterio | Responsable | Fecha límite |',
            '| --- | --- | --- | --- |',
            ...openIssues.map(
              (i) =>
                `| ${i.project.name} | ${i.criterion.id} ${i.criterion.title} | ${i.owner || 'Sin asignar'} | ${i.due ? formatDate(i.due) : 'Sin fecha'} |`,
            ),
          ]
        : ['Sin incumplimientos abiertos.']),
      '',
      '## Registros',
      '',
      '| Fecha | Proyecto | Tipo | Detalle |',
      '| --- | --- | --- | --- |',
      ...events.map((e) =>
        e.type === 'evaluation'
          ? `| ${formatDate(e.date)} | ${e.project.name} | Evaluación | ${e.score}/100 · ${e.pass} cumple · ${e.fail} no cumple · ${e.pending} pendientes |`
          : `| ${formatDate(e.date)} | ${e.project.name} | Escaneo | ${e.scan.violations.length} reglas con errores · ${e.scan.source} |`,
      ),
    ]
    downloadFile(`${fileBase}.md`, lines.join('\n'), 'text/markdown')
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Historial</h1>
          <p className="muted">Evolución de la puntuación y registro de evaluaciones y escaneos.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={downloadCsv} disabled={!events.length}>
            Descargar CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={downloadMarkdown} disabled={!events.length}>
            Descargar reporte
          </button>
        </div>
      </header>

      <div className="filters" role="group" aria-label="Filtros del historial">
        <label className="field">
          <span>Proyecto</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="all">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Año</span>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value)
              if (e.target.value === 'all') setMonth('all')
            }}
          >
            <option value="all">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Mes</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={year === 'all'}>
            <option value="all">Todos</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section aria-label="Indicadores del periodo" className="kpi-grid kpi-grid-3">
        <div className="card kpi">
          <span className="muted small">Puntuación promedio al cierre</span>
          <span className="kpi-value">
            <AnimatedNumber value={closing} />
            <span className="kpi-suffix">/100</span>
          </span>
        </div>
        <div className="card kpi">
          <span className="muted small">Cambio en el periodo</span>
          <span className={`kpi-value ${change > 0 ? 'tone-good' : change < 0 ? 'tone-bad' : ''}`}>
            {change > 0 ? '+' : change < 0 ? '−' : ''}
            <AnimatedNumber value={Math.abs(change)} />
            <span className="kpi-suffix">pts</span>
          </span>
        </div>
        <div className="card kpi">
          <span className="muted small">Escaneos automáticos</span>
          <span className="kpi-value">
            <AnimatedNumber value={scanCount} />
          </span>
        </div>
      </section>

      <section className="card" aria-labelledby="h-chart">
        <div className="card-head">
          <h2 id="h-chart">Puntuación en el tiempo</h2>
          <span className="muted small">
            {projectLabel} · {periodLabel}
          </span>
        </div>
        <HistoryChart series={series} animKey={`${projectId}-${year}-${month}`} />
        {selected.length > MAX_SERIES && (
          <p className="muted small">
            La gráfica muestra los primeros {MAX_SERIES} proyectos. Filtra por proyecto para ver los demás.
          </p>
        )}
      </section>

      <section className="card" aria-labelledby="h-events">
        <div className="card-head">
          <h2 id="h-events">Registros</h2>
          <span className="muted small" role="status">
            {events.length} {events.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        {events.length === 0 ? (
          <p className="muted">No hay registros en este periodo.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Proyecto</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={`${e.project.id}-${e.type}-${e.date}-${i}`}>
                    <td data-label="Fecha" className="tabular">{formatDate(e.date)}</td>
                    <td data-label="Proyecto">{e.project.name}</td>
                    <td data-label="Tipo">
                      <span className="chip">{e.type === 'evaluation' ? 'Evaluación' : 'Escaneo'}</span>
                    </td>
                    <td data-label="Detalle">
                      {e.type === 'evaluation' ? (
                        <>
                          <strong>{e.score}</strong>/100 · {e.pass} cumple · {e.fail} no cumple · {e.pending} pendientes
                        </>
                      ) : (
                        <>
                          {e.scan.violations.length} reglas con errores · <span className="muted">{e.scan.source}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
