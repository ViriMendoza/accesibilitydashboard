import { CRITERIA, PRINCIPLES, computeStats, criteriaFor } from '../data/criteria'
import ScoreRing from './ScoreRing'
import ProgressBar, { AnimatedNumber } from './ProgressBar'

export default function Overview({ projects, onOpenProject }) {
  const stats = projects.map((p) => ({ project: p, ...computeStats(p) }))
  const avgScore = stats.length ? Math.round(stats.reduce((sum, s) => sum + s.score, 0) / stats.length) : 0
  const totalFails = stats.reduce((sum, s) => sum + s.fail, 0)
  const totalPending = stats.reduce((sum, s) => sum + s.pending, 0)

  // Criterios que más fallan entre todos los proyectos: dónde invertir primero.
  const failCounts = CRITERIA.map((c) => ({
    criterion: c,
    count: projects.filter((p) => p.checks[c.id] === 'fail').length,
  }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count || a.criterion.level.localeCompare(b.criterion.level))
    .slice(0, 5)

  const byPrinciple = PRINCIPLES.map((pr) => {
    let pass = 0
    let applicable = 0
    projects.forEach((p) =>
      criteriaFor(p).filter((c) => c.principle === pr.id).forEach((c) => {
        const v = p.checks[c.id] ?? 'pending'
        if (v !== 'na') applicable++
        if (v === 'pass') pass++
      }),
    )
    return { ...pr, pct: applicable ? Math.round((pass / applicable) * 100) : 0 }
  })

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Resumen</h1>
          <p className="muted">Estado de accesibilidad de tus proyectos según WCAG 2.2.</p>
        </div>
      </header>

      <section aria-label="Indicadores" className="kpi-grid">
        <Kpi label="Puntuación promedio" value={avgScore} suffix="/100" />
        <Kpi label="Proyectos" value={projects.length} />
        <Kpi label="Incumplimientos abiertos" value={totalFails} tone={totalFails ? 'bad' : undefined} />
        <Kpi label="Criterios por evaluar" value={totalPending} />
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="h-projects">
          <h2 id="h-projects">Proyectos</h2>
          {stats.length === 0 ? (
            <p className="muted">Aún no hay proyectos.</p>
          ) : (
            <ul className="project-rows">
              {stats.map(({ project, score, fail, progress }) => (
                <li key={project.id}>
                  <button type="button" className="project-row" onClick={() => onOpenProject(project.id)}>
                    <ScoreRing score={score} size={44} />
                    <span className="project-row-main">
                      <span className="project-row-name">{project.name}</span>
                      <span className="muted small">
                        {fail} incumplimientos · {progress}% evaluado
                      </span>
                    </span>
                    <span className="chip">{project.target}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="h-principles">
          <h2 id="h-principles">Cumplimiento por principio</h2>
          <ul className="bars">
            {byPrinciple.map((pr) => (
              <li key={pr.id}>
                <div className="bar-head">
                  <span>{pr.name}</span>
                  <span className="tabular">
                    <AnimatedNumber value={pr.pct} />%
                  </span>
                </div>
                <ProgressBar value={pr.pct} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" aria-labelledby="h-top">
        <h2 id="h-top">Problemas más frecuentes</h2>
        {failCounts.length === 0 ? (
          <p className="muted">Sin incumplimientos registrados. ¡Buen trabajo!</p>
        ) : (
          <ol className="issue-list">
            {failCounts.map(({ criterion, count }) => (
              <li key={criterion.id}>
                <span className="mono muted">{criterion.id}</span>
                <span className="issue-title">
                  {criterion.title}
                  <span className="muted small">{criterion.hint}</span>
                </span>
                <span className="chip chip-bad">
                  {count} {count === 1 ? 'proyecto' : 'proyectos'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}

function Kpi({ label, value, suffix, tone }) {
  return (
    <div className="card kpi">
      <span className="muted small">{label}</span>
      <span className={`kpi-value ${tone ? `tone-${tone}` : ''}`}>
        <AnimatedNumber value={value} />
        {suffix && <span className="kpi-suffix">{suffix}</span>}
      </span>
    </div>
  )
}
