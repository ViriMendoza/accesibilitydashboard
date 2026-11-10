import { useState } from 'react'
import { TIPS, TIP_CATEGORIES } from '../data/tips'

export default function Tips() {
  const [category, setCategory] = useState('Todos')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const visible = TIPS.filter(
    (t) =>
      (category === 'Todos' || t.category === category) &&
      (!q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q)),
  )

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Consejos de accesibilidad</h1>
          <p className="muted">Buenas prácticas para aplicar en diseño y desarrollo.</p>
        </div>
      </header>

      <div className="tips-toolbar">
        <label className="search">
          <span className="visually-hidden">Buscar consejos</span>
          <input type="search" placeholder="Buscar consejos…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="segmented" role="group" aria-label="Filtrar por categoría">
          {TIP_CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small" role="status">
        {visible.length} {visible.length === 1 ? 'consejo' : 'consejos'}
      </p>

      <ul className="tips-grid">
        {visible.map((tip) => (
          <li key={tip.title} className="card tip">
            <span className="chip">{tip.category}</span>
            <h2 className="tip-title">{tip.title}</h2>
            <p>{tip.body}</p>
            {tip.code && (
              <pre>
                <code>{tip.code}</code>
              </pre>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
