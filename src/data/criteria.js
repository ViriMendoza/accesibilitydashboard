// Subconjunto práctico de WCAG 2.2 agrupado por los principios POUR.
export const PRINCIPLES = [
  { id: 'perceptible', name: 'Perceptible', description: 'La información debe poder percibirse por distintos sentidos.' },
  { id: 'operable', name: 'Operable', description: 'La interfaz debe poder usarse con distintos métodos de entrada.' },
  { id: 'comprensible', name: 'Comprensible', description: 'El contenido y la operación deben ser claros y predecibles.' },
  { id: 'robusto', name: 'Robusto', description: 'Compatible con tecnologías de asistencia actuales y futuras.' },
]

export const CRITERIA = [
  { id: '1.1.1', principle: 'perceptible', level: 'A', title: 'Contenido no textual', hint: 'Imágenes, iconos y gráficos tienen texto alternativo significativo (o alt="" si son decorativos).' },
  { id: '1.2.2', principle: 'perceptible', level: 'A', title: 'Subtítulos (grabados)', hint: 'Los videos con audio incluyen subtítulos sincronizados.' },
  { id: '1.3.1', principle: 'perceptible', level: 'A', title: 'Información y relaciones', hint: 'Encabezados, listas, tablas y formularios usan el marcado semántico correcto.' },
  { id: '1.3.5', principle: 'perceptible', level: 'AA', title: 'Propósito de los campos', hint: 'Los campos de datos personales usan el atributo autocomplete adecuado.' },
  { id: '1.4.1', principle: 'perceptible', level: 'A', title: 'Uso del color', hint: 'El color no es el único medio para transmitir información (errores, estados, enlaces).' },
  { id: '1.4.3', principle: 'perceptible', level: 'AA', title: 'Contraste mínimo', hint: 'Texto normal ≥ 4.5:1 y texto grande ≥ 3:1 frente a su fondo.' },
  { id: '1.4.4', principle: 'perceptible', level: 'AA', title: 'Cambio de tamaño del texto', hint: 'El texto puede ampliarse al 200 % sin perder contenido ni funcionalidad.' },
  { id: '1.4.10', principle: 'perceptible', level: 'AA', title: 'Reajuste (reflow)', hint: 'A 320 px de ancho no aparece scroll horizontal.' },
  { id: '1.4.11', principle: 'perceptible', level: 'AA', title: 'Contraste no textual', hint: 'Bordes de inputs, iconos y estados de foco tienen contraste ≥ 3:1.' },

  { id: '2.1.1', principle: 'operable', level: 'A', title: 'Teclado', hint: 'Toda la funcionalidad es accesible con teclado.' },
  { id: '2.1.2', principle: 'operable', level: 'A', title: 'Sin trampas de teclado', hint: 'El foco puede salir de cualquier componente (modales, iframes, widgets).' },
  { id: '2.4.1', principle: 'operable', level: 'A', title: 'Evitar bloques', hint: 'Existe un enlace "Saltar al contenido" o landmarks equivalentes.' },
  { id: '2.4.2', principle: 'operable', level: 'A', title: 'Título de página', hint: 'Cada página tiene un <title> único y descriptivo.' },
  { id: '2.4.3', principle: 'operable', level: 'A', title: 'Orden del foco', hint: 'El foco sigue un orden lógico que preserva el significado.' },
  { id: '2.4.4', principle: 'operable', level: 'A', title: 'Propósito de los enlaces', hint: 'El texto del enlace indica su destino (evitar "clic aquí").' },
  { id: '2.4.7', principle: 'operable', level: 'AA', title: 'Foco visible', hint: 'El indicador de foco siempre es visible.' },
  { id: '2.4.11', principle: 'operable', level: 'AA', title: 'Foco no oculto', hint: 'El elemento enfocado no queda tapado por headers fijos, banners o chats.' },
  { id: '2.5.8', principle: 'operable', level: 'AA', title: 'Tamaño del objetivo', hint: 'Los objetivos táctiles miden al menos 24 × 24 px.' },
  { id: '2.3.1', principle: 'operable', level: 'A', title: 'Destellos', hint: 'Nada destella más de 3 veces por segundo.' },

  { id: '3.1.1', principle: 'comprensible', level: 'A', title: 'Idioma de la página', hint: 'El elemento <html> declara el atributo lang correcto.' },
  { id: '3.2.2', principle: 'comprensible', level: 'A', title: 'Al recibir entradas', hint: 'Cambiar un campo no provoca cambios de contexto inesperados.' },
  { id: '3.3.1', principle: 'comprensible', level: 'A', title: 'Identificación de errores', hint: 'Los errores se describen en texto y se asocian al campo.' },
  { id: '3.3.2', principle: 'comprensible', level: 'A', title: 'Etiquetas o instrucciones', hint: 'Cada campo tiene una etiqueta visible y persistente.' },
  { id: '3.3.8', principle: 'comprensible', level: 'AA', title: 'Autenticación accesible', hint: 'El login no exige resolver acertijos cognitivos; permite pegar contraseñas.' },

  { id: '4.1.2', principle: 'robusto', level: 'A', title: 'Nombre, función, valor', hint: 'Los componentes personalizados exponen rol, nombre y estado (ARIA correcto).' },
  { id: '4.1.3', principle: 'robusto', level: 'AA', title: 'Mensajes de estado', hint: 'Toasts y confirmaciones se anuncian con aria-live sin mover el foco.' },
]

export const STATUSES = [
  { id: 'pending', label: 'Pendiente' },
  { id: 'pass', label: 'Cumple' },
  { id: 'fail', label: 'No cumple' },
  { id: 'na', label: 'No aplica' },
]

// Con meta "A" solo cuentan los criterios de nivel A.
export function criteriaFor(project) {
  return CRITERIA.filter((c) => project.target === 'AA' || c.level === 'A')
}

export function computeStats(project) {
  const criteria = criteriaFor(project)
  const values = criteria.map((c) => project.checks[c.id] ?? 'pending')
  const pass = values.filter((v) => v === 'pass').length
  const fail = values.filter((v) => v === 'fail').length
  const na = values.filter((v) => v === 'na').length
  const applicable = criteria.length - na
  const evaluated = pass + fail
  return {
    pass,
    fail,
    na,
    pending: applicable - evaluated,
    // Puntuación: criterios cumplidos sobre los que aplican.
    score: applicable ? Math.round((pass / applicable) * 100) : 0,
    progress: applicable ? Math.round((evaluated / applicable) * 100) : 0,
  }
}
