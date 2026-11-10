import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

export default function ProgressBar({ value }) {
  const animated = useAnimatedNumber(value, 1100)
  return (
    <span className="bar" aria-hidden="true">
      <span className="bar-fill" style={{ width: `${animated}%` }} />
    </span>
  )
}

export function AnimatedNumber({ value }) {
  const animated = useAnimatedNumber(value, 900)
  return (
    <>
      <span aria-hidden="true">{Math.round(animated)}</span>
      <span className="visually-hidden">{value}</span>
    </>
  )
}
