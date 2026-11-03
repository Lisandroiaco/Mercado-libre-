import { discountPercent, formatPrice, installmentValue } from '../lib/format'
import type { Product } from '../types'

interface Props {
  product: Product
  size?: 'sm' | 'lg'
}

export function Price({ product, size = 'sm' }: Props) {
  const off = discountPercent(product.price, product.originalPrice)
  const big = size === 'lg'
  return (
    <div>
      {product.originalPrice && off > 0 && (
        <s className={`block text-neutral-500 ${big ? 'text-base' : 'text-xs'}`}>
          {formatPrice(product.originalPrice)}
        </s>
      )}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`whitespace-nowrap ${big ? 'text-4xl font-light' : 'text-2xl font-normal'}`}>{formatPrice(product.price)}</span>
        {off > 0 && <span className={`whitespace-nowrap text-success ${big ? 'text-lg' : 'text-sm'}`}>{off}% OFF</span>}
      </div>
      <p className={`text-success ${big ? 'text-base' : 'text-sm'}`}>
        Mismo precio en {product.installments} cuotas de {formatPrice(installmentValue(product.price, product.installments))}
      </p>
    </div>
  )
}
