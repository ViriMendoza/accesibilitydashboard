import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../utils/date'

const Y_TICKS = [0, 25, 50, 75, 100]
const toMs = (iso) => new Date(`${iso}T12:00:00`).getTime()

// Puntuación vigente de una serie en una fecha: el último punto igual o anterior.
function pointAt(points, date) {
  let found = null
  for (const p of points) {
    if (p.date > date) break
    found = p
  }
  return found
}

function xTicks(min, max, count) {
  const span = max - min
  const options = span > 60 * 86_400_000 ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' }
  return Array.from({ length: count }, (_, i) => {
    const ms = min + (span * i) / (count - 1)
    return { ms, label: new Date(ms).toLocaleDateString('es-MX', options) }
  })
}

// El contenedor mide el ancho disponible; el cuerpo dibuja con ese ancho.
export default function HistoryChart({ series, animKey }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(640)

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [])

  const hasData = series.some((s) => s.points.length > 0)
  return (
    <div className="chart" ref={wrapRef}>
      {hasData ? (
        <ChartBody key={animKey} series={series} width={width} />
      ) : (
        <p className="chart-empty muted">No hay registros en este periodo.</p>
      )}
    </div>
  )
}

function ChartBody({ series, width }) {
  const [active, setActive] = useState(null)
  const dates = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort()

  // Etiquetas directas al final de cada línea solo con ≤ 4 series y espacio suficiente.
  const showLabels = series.length <= 4 && width > 520
  const narrow = width < 480
  const HEIGHT = narrow ? 220 : 260
  const tickCount = narrow ? 3 : 5
  const m = { top: 16, right: showLabels ? 132 : 20, bottom: 30, left: 36 }
  const innerW = Math.max(width - m.left - m.right, 10)
  const innerH = HEIGHT - m.top - m.bottom

  let min = toMs(dates[0])
  let max = toMs(dates[dates.length - 1])
  if (min === max) {
    min -= 15 * 86_400_000
    max += 15 * 86_400_000
  }
  const x = (iso) => m.left + ((toMs(iso) - min) / (max - min)) * innerW
  const y = (score) => m.top + (1 - score / 100) * innerH

  const lines = series.map((s) => ({
    ...s,
    d: s.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.score).toFixed(1)}`).join(''),
    last: s.points[s.points.length - 1],
  }))

  // Separa etiquetas finales que se encimarían (mínimo 16 px entre ellas).
  const labels = lines
    .filter((l) => l.last)
    .map((l) => ({ id: l.id, name: l.name, score: l.last.score, y: y(l.last.score), x: x(l.last.date) }))
    .sort((a, b) => a.y - b.y)
  labels.forEach((l, i) => {
    if (i > 0 && l.y - labels[i - 1].y < 16) l.y = labels[i - 1].y + 16
  })

  function onPointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    let nearest = 0
    dates.forEach((d, i) => {
      if (Math.abs(x(d) - px) < Math.abs(x(dates[nearest]) - px)) nearest = i
    })
    setActive(nearest)
  }

  function onKeyDown(e) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(e.key)) return
    e.preventDefault()
    const current = active ?? -1
    if (e.key === 'ArrowRight') setActive(Math.min(current + 1, dates.length - 1))
    if (e.key === 'ArrowLeft') setActive(Math.max(current - 1, 0))
    if (e.key === 'Home') setActive(0)
    if (e.key === 'End') setActive(dates.length - 1)
    if (e.key === 'Escape') setActive(null)
  }

  const activeDate = active != null ? dates[active] : null
  const readout = activeDate
    ? series.map((s) => {
        const point = pointAt(s.points, activeDate)
        return { id: s.id, name: s.name, slot: s.slot, value: point?.score ?? null, from: point?.date }
      })
    : []
  const tooltipLeft = activeDate ? Math.min(Math.max(x(activeDate), 90), width - 90) : 0

  return (
    <>
      {series.length >= 2 && (
        <ul className="legend" aria-label="Leyenda">
          {series.map((s) => (
            <li key={s.id}>
              <span className="legend-key" style={{ background: `var(--series-${s.slot})` }} aria-hidden="true" />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div
        className="chart-plot"
        tabIndex={0}
        role="group"
        aria-label="Gráfica de puntuación en el tiempo. Usa las flechas izquierda y derecha para recorrer las fechas."
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <svg width={width} height={HEIGHT} aria-hidden="true">
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line className="grid" x1={m.left} x2={m.left + innerW} y1={y(t)} y2={y(t)} />
              <text className="axis" x={m.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {xTicks(min, max, tickCount).map((t, i) => (
            <text
              key={i}
              className="axis"
              x={m.left + ((t.ms - min) / (max - min)) * innerW}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? 'start' : i === tickCount - 1 ? 'end' : 'middle'}
            >
              {t.label}
            </text>
          ))}

          {lines.length === 1 && lines[0].points.length > 1 && (
            <path
              className="area"
              style={{ fill: `var(--series-${lines[0].slot})` }}
              d={`${lines[0].d}L${x(lines[0].last.date)},${y(0)}L${x(lines[0].points[0].date)},${y(0)}Z`}
            />
          )}
          {lines.map((l) => (
            <path key={l.id} className="line" pathLength="1" d={l.d} style={{ stroke: `var(--series-${l.slot})` }} />
          ))}
          {lines.map((l) =>
            l.last ? (
              <circle
                key={l.id}
                className="end-dot"
                cx={x(l.last.date)}
                cy={y(l.last.score)}
                r="4"
                style={{ fill: `var(--series-${l.slot})` }}
              />
            ) : null,
          )}
          {showLabels &&
            labels.map((l) => (
              <text key={l.id} className="end-label" x={m.left + innerW + 10} y={l.y} dy="0.32em">
                <tspan className="end-label-value">{l.score}</tspan> {l.name}
              </text>
            ))}

          {activeDate && (
            <g>
              <line className="crosshair" x1={x(activeDate)} x2={x(activeDate)} y1={m.top} y2={m.top + innerH} />
              {readout.map((r) =>
                r.from === activeDate ? (
                  <circle
                    key={r.id}
                    className="end-dot"
                    cx={x(activeDate)}
                    cy={y(r.value)}
                    r="4"
                    style={{ fill: `var(--series-${r.slot})` }}
                  />
                ) : null,
              )}
            </g>
          )}

          <rect
            className="hit"
            x={m.left}
            y={m.top}
            width={innerW}
            height={innerH}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {activeDate && (
          <div className="tooltip" style={{ left: tooltipLeft }}>
            <span className="tooltip-date">{formatDate(activeDate)}</span>
            {readout.map((r) => (
              <span key={r.id} className="tooltip-row">
                <span className="legend-key" style={{ background: `var(--series-${r.slot})` }} aria-hidden="true" />
                <strong>{r.value ?? '—'}</strong>
                <span className="muted">
                  {r.name}
                  {r.from && r.from !== activeDate && ` (al ${formatDate(r.from, { day: 'numeric', month: 'short' })})`}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {activeDate &&
          `${formatDate(activeDate)}: ${readout.map((r) => `${r.name} ${r.value ?? 'sin datos'}`).join(', ')}`}
      </p>
    </>
  )
}
