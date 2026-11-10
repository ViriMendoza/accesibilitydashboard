import { useRef, useState } from 'react'
import { computeStats } from '../data/criteria'
import ScoreRing from './ScoreRing'

export default function Projects({ projects, onOpenProject, onCreate }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState({ name: '', client: '', target: 'AA' })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate({ ...form, name: form.name.trim(), client: form.client.trim() })
    setForm({ name: '', client: '', target: 'AA' })
    dialogRef.current.close()
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Proyectos</h1>
          <p className="muted">Selecciona un proyecto para auditar sus criterios.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => dialogRef.current.showModal()}>
          Nuevo proyecto
        </button>
      </header>

      {projects.length === 0 ? (
        <div className="card empty">
          <p>Aún no hay proyectos. Crea el primero para empezar la auditoría.</p>
        </div>
      ) : (
        <ul className="project-grid">
          {projects.map((p) => {
            const s = computeStats(p)
            return (
              <li key={p.id}>
                <button type="button" className="card project-card" onClick={() => onOpenProject(p.id)}>
                  <span className="project-card-top">
                    <span>
                      <span className="project-card-name">{p.name}</span>
                      <span className="muted small">{p.client || 'Sin cliente'}</span>
                    </span>
                    <ScoreRing score={s.score} />
                  </span>
                  <span className="stat-row">
                    <Stat label="Cumple" value={s.pass} tone="good" />
                    <Stat label="No cumple" value={s.fail} tone="bad" />
                    <Stat label="Pendiente" value={s.pending} />
                  </span>
                  <span className="bar" aria-hidden="true">
                    <span className="bar-fill" style={{ width: `${s.progress}%` }} />
                  </span>
                  <span className="muted small">
                    {s.progress}% evaluado · Meta WCAG {p.target} · Actualizado {p.updatedAt}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <dialog ref={dialogRef} className="dialog" aria-labelledby="new-project-title">
        <form onSubmit={submit}>
          <h2 id="new-project-title">Nuevo proyecto</h2>
          <label className="field">
            <span>Nombre del proyecto</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Cliente</span>
            <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </label>
          <label className="field">
            <span>Nivel objetivo</span>
            <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
              <option value="A">WCAG A</option>
              <option value="AA">WCAG AA (recomendado)</option>
            </select>
          </label>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => dialogRef.current.close()}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

function Stat({ label, value, tone }) {
  return (
    <span className="stat">
      <span className={`stat-value ${tone ? `tone-${tone}` : ''}`}>{value}</span>
      <span className="muted small">{label}</span>
    </span>
  )
}
