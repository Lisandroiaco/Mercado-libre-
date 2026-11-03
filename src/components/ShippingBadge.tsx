import { Zap } from 'lucide-react'
import type { Product } from '../types'

export function ShippingBadge({ product }: { product: Product }) {
  if (!product.freeShipping) return null
  return (
    <p className="text-sm font-semibold text-success">
      Envío gratis
      {product.fullShipping && (
        <span className="ml-1 inline-flex items-center font-bold italic text-success">
          <Zap size={12} className="fill-success" />
          FULL
        </span>
      )}
    </p>
  )
}
