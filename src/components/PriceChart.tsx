import { formatPrice } from '../lib/format'

interface Props {
  points: { month: string; price: number }[]
}

/** Small line chart of the last months' prices. */
export function PriceChart({ points }: Props) {
  const W = 320
  const H = 120
  const pad = { top: 16, right: 12, bottom: 22, left: 12 }
  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const x = (i: number) => pad.left + (i / (points.length - 1)) * (W - pad.left - pad.right)
  const y = (v: number) => pad.top + (1 - (v - min) / span) * (H - pad.top - pad.bottom)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1)},${H - pad.bottom} L${x(0)},${H - pad.bottom} Z`
  const last = points[points.length - 1]
  const lowest = last.price <= min

  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`Historial de precios: de ${formatPrice(points[0].price)} a ${formatPrice(last.price)}`}>
        <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} className="stroke-neutral-200" />
        <path d={area} className="fill-primary/10" />
        <path d={line} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) => (
          <text key={p.month} x={x(i)} y={H - 6} textAnchor="middle" className="fill-neutral-500 text-[10px]">
            {p.month}
          </text>
        ))}
        <circle cx={x(points.length - 1)} cy={y(last.price)} r={4} className="fill-primary stroke-surface" strokeWidth={2} />
      </svg>
      <figcaption className="text-sm text-neutral-600">
        {lowest ? (
          <span className="font-semibold text-success">Es el precio más bajo de los últimos 6 meses.</span>
        ) : (
          <>Precio más bajo en 6 meses: {formatPrice(min)}</>
        )}
      </figcaption>
    </figure>
  )
}
