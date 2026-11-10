import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import Projects from './components/Projects'
import ProjectDetail from './components/ProjectDetail'
import Tips from './components/Tips'
import { useLocalStorage } from './hooks/useLocalStorage'
import { SAMPLE_PROJECTS } from './data/sampleProjects'

const TITLES = { overview: 'Resumen', projects: 'Proyectos', tips: 'Consejos' }

function parseHash() {
  const [view = 'overview', id] = window.location.hash.slice(1).split('/')
  return { view: view || 'overview', id }
}

const today = () => new Date().toISOString().slice(0, 10)

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [projects, setProjects] = useLocalStorage('a11y-projects', SAMPLE_PROJECTS)
  const [theme, setTheme] = useLocalStorage(
    'a11y-theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  const [message, setMessage] = useState('')
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
    setProjects([...projects, { id, ...data, notes: '', checks: {}, updatedAt: today() }])
    navigate(`project/${id}`)
  }

  function updateProject(updated) {
    setProjects(projects.map((p) => (p.id === updated.id ? { ...updated, updatedAt: today() } : p)))
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
      />
    )
  } else if (route.view === 'projects' || route.view === 'project') {
    content = <Projects projects={projects} onOpenProject={(id) => navigate(`project/${id}`)} onCreate={createProject} />
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
