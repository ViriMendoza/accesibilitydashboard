import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import Projects from './components/Projects'
import ProjectDetail from './components/ProjectDetail'
import Tips from './components/Tips'
import History from './components/History'
import { useLocalStorage } from './hooks/useLocalStorage'
import { SAMPLE_PROJECTS } from './data/sampleProjects'
import { computeStats } from './data/criteria'
import { today } from './utils/date'

const TITLES = { overview: 'Resumen', projects: 'Proyectos', history: 'Historial', tips: 'Consejos' }

function parseHash() {
  const [view = 'overview', id] = window.location.hash.slice(1).split('/')
  return { view: view || 'overview', id }
}

function snapshot(project, date = today()) {
  const { score, pass, fail, pending } = computeStats(project)
  return { date, score, pass, fail, pending }
}

// Una foto por día: si ya existe la de hoy, se reemplaza.
function withSnapshot(project) {
  const history = (project.history ?? []).filter((h) => h.date !== today())
  return { ...project, history: [...history, snapshot(project)] }
}

// Completa proyectos guardados antes de que existieran responsables e historial.
function normalize(project) {
  if (project.history && project.issues) return project
  const sample = SAMPLE_PROJECTS.find((s) => s.id === project.id)
  return {
    ...project,
    issues: project.issues ?? sample?.issues ?? {},
    history: project.history ?? sample?.history ?? [snapshot(project, project.updatedAt ?? today())],
  }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [storedProjects, setProjects] = useLocalStorage('a11y-projects', SAMPLE_PROJECTS)
  const projects = storedProjects.map(normalize)
  const [theme, setTheme] = useLocalStorage(
    'a11y-theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Con el menú móvil abierto, el resto de la página queda inerte y sin scroll.
  useEffect(() => {
    mainRef.current.inert = menuOpen
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  // Si la pantalla crece a escritorio con el menú abierto, se cierra.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)')
    const onChange = (e) => e.matches && setMenuOpen(false)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  const project = route.view === 'project' ? projects.find((p) => p.id === route.id) : null
  const pageTitle = project ? project.name : TITLES[route.view] ?? 'Resumen'

  // Al cambiar de vista: título único y foco en el contenido principal (WCAG 2.4.2 y 2.4.3).
  useEffect(() => {
    document.title = `${pageTitle} · Accesibilidad`
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo(0, 0)
  }, [route.view, route.id, pageTitle])

  const navigate = (hash) => {
    window.location.hash = hash
  }

  function createProject(data) {
    const id = `p-${Date.now()}`
    setProjects([...projects, withSnapshot({ id, ...data, notes: '', checks: {}, issues: {}, history: [], updatedAt: today() })])
    navigate(`project/${id}`)
  }

  function updateProject(updated) {
    setProjects(projects.map((p) => (p.id === updated.id ? withSnapshot({ ...updated, updatedAt: today() }) : p)))
  }

  function deleteProject(id) {
    const target = projects.find((p) => p.id === id)
    if (!window.confirm(`¿Eliminar "${target.name}"? Esta acción no se puede deshacer.`)) return
    setProjects(projects.filter((p) => p.id !== id))
    setMessage(`Proyecto ${target.name} eliminado`)
    navigate('projects')
  }

  let content
  if (route.view === 'project' && project) {
    content = (
      <ProjectDetail
        project={project}
        onBack={() => navigate('projects')}
        onUpdate={updateProject}
        onDelete={deleteProject}
        announce={setMessage}
        owners={[...new Set(projects.flatMap((p) => Object.values(p.issues).map((i) => i.owner)).filter(Boolean))]}
      />
    )
  } else if (route.view === 'projects' || route.view === 'project') {
    content = <Projects projects={projects} onOpenProject={(id) => navigate(`project/${id}`)} onCreate={createProject} />
  } else if (route.view === 'history') {
    content = <History projects={projects} />
  } else if (route.view === 'tips') {
    content = <Tips />
  } else {
    content = <Overview projects={projects} onOpenProject={(id) => navigate(`project/${id}`)} />
  }

  return (
    <div className="layout">
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), mainRef.current.focus())}>
        Saltar al contenido
      </a>
      <Sidebar
        view={route.view === 'project' ? 'projects' : route.view}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        {/* La key reinicia la animación de entrada en cada cambio de vista. */}
        <div key={`${route.view}/${route.id ?? ''}`} className="view">
          {content}
        </div>
      </main>
      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  )
}
