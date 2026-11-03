import { Star } from 'lucide-react'

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i + 1))
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="absolute text-primary" strokeWidth={1.5} />
            <span className="absolute overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="fill-primary text-primary" strokeWidth={1.5} />
            </span>
          </span>
        )
      })}
    </span>
  )
}
