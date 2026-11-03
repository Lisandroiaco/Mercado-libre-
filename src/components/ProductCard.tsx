import { Link } from 'react-router-dom'
import { formatSold } from '../lib/format'
import type { Product } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { Price } from './Price'
import { ProductImage } from './ProductImage'
import { ShippingBadge } from './ShippingBadge'
import { Stars } from './Stars'

/** Vertical card used on the home page carousels and grids. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/producto/${product.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-md bg-white shadow-sm transition hover:shadow-lg"
    >
      <FavoriteButton productId={product.id} className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100" />
      <ProductImage product={product} className="aspect-square border-b border-neutral-100" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm text-neutral-700">{product.title}</h3>
        <Price product={product} />
        <ShippingBadge product={product} />
      </div>
    </Link>
  )
}

/** Horizontal row used on the search results page. */
export function ProductListItem({ product }: { product: Product }) {
  return (
    <Link
      to={`/producto/${product.id}`}
      className="group relative flex gap-4 border-b border-neutral-200 bg-white p-4 transition last:border-0 hover:bg-neutral-50 sm:gap-6 sm:p-5"
    >
      <ProductImage product={product} className="size-28 shrink-0 rounded sm:size-40" />
      <div className="min-w-0 flex-1 space-y-1">
        {product.condition === 'usado' && (
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">Usado</span>
        )}
        <h2 className="pr-10 text-base text-neutral-800 sm:text-lg">{product.title}</h2>
        <p className="text-xs text-neutral-500">Por {product.seller}</p>
        <p className="flex items-center gap-1 text-xs text-neutral-500">
          {product.rating} <Stars rating={product.rating} size={12} /> ({product.reviewsCount}) · {formatSold(product.sold)}
        </p>
        <Price product={product} />
        <ShippingBadge product={product} />
      </div>
      <FavoriteButton productId={product.id} className="absolute right-4 top-4" />
    </Link>
  )
}
