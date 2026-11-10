// Fechas en formato YYYY-MM-DD según la zona horaria local (toISOString usa UTC
// y en México cambiaría de día por la tarde).
export const today = () => new Date().toLocaleDateString('en-CA')

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function formatDate(iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return ''
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('es-MX', options)
}

export function daysUntil(iso) {
  const ms = new Date(`${iso}T12:00:00`) - new Date(`${today()}T12:00:00`)
  return Math.round(ms / 86_400_000)
}

// Estado de una fecha límite para mostrarlo con texto, no solo con color.
export function dueStatus(iso) {
  if (!iso) return null
  const days = daysUntil(iso)
  if (days < 0) return { tone: 'bad', label: `Vencido hace ${-days} ${-days === 1 ? 'día' : 'días'}` }
  if (days === 0) return { tone: 'warn', label: 'Vence hoy' }
  if (days <= 7) return { tone: 'warn', label: `Vence en ${days} ${days === 1 ? 'día' : 'días'}` }
  return { tone: 'neutral', label: `Vence el ${formatDate(iso)}` }
}
