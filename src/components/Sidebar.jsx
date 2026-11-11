import { useEffect, useRef } from 'react'

const NAV = [
  { id: 'overview', label: 'Resumen', icon: 'M3 12h4l3-8 4 16 3-8h4' },
  { id: 'projects', label: 'Proyectos', icon: 'M3 7h18M3 12h18M3 17h12' },
  { id: 'history', label: 'Historial', icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' },
  { id: 'tips', label: 'Consejos', icon: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z' },
]

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">a11y</span>
      <span className="brand-name">Accesibilidad</span>
    </div>
  )
}

// En escritorio es una barra lateral fija; en móvil, un panel que se abre con el botón de menú.
export default function Sidebar({ view, theme, onToggleTheme, open, onOpenChange }) {
  const menuButtonRef = useRef(null)
  const topbarRef = useRef(null)
  const drawerRef = useRef(null)
  const wasOpen = useRef(false)
  // Al elegir una sección el foco va al contenido nuevo, no de vuelta al botón de menú.
  const restoreFocus = useRef(true)

  const close = (restore = true) => {
    restoreFocus.current = restore
    onOpenChange(false)
  }

  useEffect(() => {
    topbarRef.current.inert = open
    if (open) {
      drawerRef.current.querySelector('a, button')?.focus()
    } else if (wasOpen.current && restoreFocus.current) {
      menuButtonRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <header className="topbar" ref={topbarRef}>
        <Brand />
        <button
          ref={menuButtonRef}
          type="button"
          className="icon-button"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => onOpenChange(true)}
        >
          <Icon d="M4 6h16M4 12h16M4 18h16" />
          <span className="visually-hidden">Abrir menú</span>
        </button>
      </header>

      {open && <div className="scrim" onClick={() => close()} aria-hidden="true" />}

      <aside
        id="sidebar"
        ref={drawerRef}
        className={`sidebar ${open ? 'is-open' : ''}`}
        aria-label="Menú"
        {...(open ? { role: 'dialog', 'aria-modal': 'true' } : {})}
      >
        <div className="sidebar-head">
          <Brand />
          <button type="button" className="icon-button sidebar-close" onClick={() => close()}>
            <Icon d="M6 6l12 12M18 6L6 18" />
            <span className="visually-hidden">Cerrar menú</span>
          </button>
        </div>
        <nav aria-label="Principal">
          <ul className="nav-list">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="nav-link"
                  aria-current={view === item.id ? 'page' : undefined}
                  onClick={() => close(false)}
                >
                  <Icon d={item.icon} />
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
    </>
  )
}
