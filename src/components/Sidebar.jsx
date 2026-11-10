const NAV = [
  { id: 'overview', label: 'Resumen', icon: 'M3 12h4l3-8 4 16 3-8h4' },
  { id: 'projects', label: 'Proyectos', icon: 'M3 7h18M3 12h18M3 17h12' },
  { id: 'tips', label: 'Consejos', icon: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z' },
]

export default function Sidebar({ view, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">a11y</span>
        <span className="brand-name">Accesibilidad</span>
      </div>
      <nav aria-label="Principal">
        <ul className="nav-list">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="nav-link"
                aria-current={view === item.id ? 'page' : undefined}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d={item.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-pressed={theme === 'dark'}>
        {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      </button>
    </aside>
  )
}
