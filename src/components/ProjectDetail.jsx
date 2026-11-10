import { useState } from 'react'
import { PRINCIPLES, STATUSES, computeStats, criteriaFor } from '../data/criteria'
import ScoreRing from './ScoreRing'
import Scanner from './Scanner'

const FILTERS = [{ id: 'all', label: 'Todos' }, ...STATUSES]

export default function ProjectDetail({ project, onBack, onUpdate, onDelete, announce }) {
  const [filter, setFilter] = useState('all')
  const stats = computeStats(project)
  const criteria = criteriaFor(project)
  const scan = project.scans?.[0]

  function setStatus(criterion, status) {
    onUpdate({ ...project, checks: { ...project.checks, [criterion.id]: status } })
    announce(`${criterion.id} ${criterion.title}: ${STATUSES.find((s) => s.id === status).label}`)
  }

  function exportReport() {
    const lines = [
      `# Reporte de accesibilidad: ${project.name}`,
      `Meta: WCAG 2.2 ${project.target} · Puntuación: ${stats.score}/100`,
      '',
      ...criteria.map((c) => {
        const status = STATUSES.find((s) => s.id === (project.checks[c.id] ?? 'pending')).label
        return `- [${status}] ${c.id} ${c.title} (${c.level})`
      }),
      '',
      ...(scan
        ? [
            `## Escaneo automático (axe-core) · ${new Date(scan.date).toLocaleString('es-MX')}`,
            `Origen: ${scan.source}`,
            ...scan.violations.map((v) => `- [${v.impact}] ${v.help} (${v.id}, WCAG ${v.criteria.join(', ') || '—'}) · ${v.count} elementos`),
            '',
          ]
        : []),
      project.notes ? `## Notas\n${project.notes}` : '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `a11y-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <>
      <button type="button" className="btn btn-ghost back" onClick={onBack}>
        ← Proyectos
      </button>
      <header className="page-header">
        <div className="detail-title">
          <ScoreRing score={stats.score} size={64} />
          <div>
            <h1>{project.name}</h1>
            <p className="muted">
              {project.client || 'Sin cliente'} · Meta WCAG 2.2 {project.target} · {stats.progress}% evaluado
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={exportReport}>
            Exportar reporte
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(project.id)}>
            Eliminar
          </button>
        </div>
      </header>

      <Scanner project={project} onUpdate={onUpdate} announce={announce} />

      <div className="segmented" role="group" aria-label="Filtrar criterios por estado">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {PRINCIPLES.map((pr) => {
        const items = criteria.filter(
          (c) => c.principle === pr.id && (filter === 'all' || (project.checks[c.id] ?? 'pending') === filter),
        )
        if (items.length === 0) return null
        return (
          <section key={pr.id} className="card" aria-labelledby={`h-${pr.id}`}>
            <h2 id={`h-${pr.id}`}>{pr.name}</h2>
            <p className="muted small">{pr.description}</p>
            <ul className="criteria">
              {items.map((c) => {
                const current = project.checks[c.id] ?? 'pending'
                return (
                  <li key={c.id} className={`criterion status-${current}`}>
                    <div className="criterion-text">
                      <span className="criterion-title">
                        <span className="mono muted">{c.id}</span> {c.title} <span className="chip">{c.level}</span>
                      </span>
                      <span className="muted small">{c.hint}</span>
                    </div>
                    <fieldset className="status-picker">
                      <legend className="visually-hidden">
                        Estado de {c.id} {c.title}
                      </legend>
                      {STATUSES.map((s) => (
                        <label key={s.id} className={`status-option opt-${s.id}`}>
                          <input
                            type="radio"
                            name={`status-${c.id}`}
                            value={s.id}
                            checked={current === s.id}
                            onChange={() => setStatus(c, s.id)}
                          />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </fieldset>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <section className="card" aria-labelledby="h-notes">
        <h2 id="h-notes">Notas</h2>
        <label className="field">
          <span className="visually-hidden">Notas del proyecto</span>
          <textarea
            rows={4}
            value={project.notes}
            placeholder="Hallazgos, responsables, próximos pasos…"
            onChange={(e) => onUpdate({ ...project, notes: e.target.value })}
          />
        </label>
      </section>
    </>
  )
}
