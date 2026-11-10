import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

export function scoreTone(score) {
  if (score >= 85) return 'good'
  if (score >= 60) return 'warn'
  return 'bad'
}

export default function ScoreRing({ score, size = 56 }) {
  const animated = useAnimatedNumber(score, 1200)
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - animated / 100)

  return (
    <div className={`score-ring tone-${scoreTone(score)}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle className="score-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="score-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* El número animado es visual; el lector de pantalla recibe el valor final. */}
      <span className="score-ring-label" aria-hidden="true">
        {Math.round(animated)}
      </span>
      <span className="visually-hidden">Puntuación {score} de 100</span>
    </div>
  )
}
