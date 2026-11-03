import { Heart } from 'lucide-react'
import { useStore } from '../context/store'

export function FavoriteButton({ productId, className = '' }: { productId: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useStore()
  const active = isFavorite(productId)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(productId)
      }}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`grid size-9 place-items-center rounded-full bg-white/90 text-primary shadow transition hover:scale-110 ${className}`}
    >
      <Heart size={18} className={active ? 'fill-primary' : ''} />
    </button>
  )
}
