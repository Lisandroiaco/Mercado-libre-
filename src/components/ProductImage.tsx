import { categoryById } from '../data/categories'
import type { Product } from '../types'
import { categoryIcons } from './categoryIcons'


interface Props {
  product: Product
  /** Gallery variant: shifts the tint and angle so thumbnails look different. */
  variant?: number
  className?: string
  iconClassName?: string
  showBrand?: boolean
}

/**
 * Generated product artwork. The catalog is fully offline, so instead of remote photos
 * each product gets a consistent illustration derived from its category and id.
 */
export function ProductImage({ product, variant = 0, className = '', iconClassName = 'size-1/2', showBrand = true }: Props) {
  const Icon = categoryIcons[product.category]
  const idNum = Number(product.id.replace(/\D/g, '')) || 0
  const hue = (categoryById[product.category].hue + (idNum % 7) * 9 + variant * 25) % 360
  const rotate = [-8, 0, 8, -15][variant % 4]

  return (
    <div
      role="img"
      aria-label={product.title}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `radial-gradient(circle at 30% 25%, hsl(${hue} 90% 97%), hsl(${hue} 70% 88%))` }}
    >
      <div
        className="absolute size-3/4 rounded-full opacity-40 blur-2xl"
        style={{ background: `hsl(${(hue + 40) % 360} 80% 75%)` }}
      />
      <Icon
        className={`relative drop-shadow-md ${iconClassName}`}
        strokeWidth={1.25}
        style={{ color: `hsl(${hue} 55% 35%)`, transform: `rotate(${rotate}deg)` }}
      />
      {showBrand && (
      <span
        className="absolute bottom-2 right-3 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: `hsl(${hue} 40% 45%)` }}
      >
        {product.brand}
      </span>
      )}
    </div>
  )
}
