import { GitCompareArrows } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/store'
import { formatSold } from '../lib/format'
import type { Product } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { Price } from './Price'
import { ProductImage } from './ProductImage'
import { ShippingBadge } from './ShippingBadge'
import { Stars } from './Stars'

/** Small label shown above the title: best seller, top rated, new listing, or low stock. */
export function ProductBadge({ product }: { product: Product }) {
  let badge: { text: string; cls: string } | null = null
  if (product.userListing) badge = { text: 'TU PUBLICACIÓN', cls: 'bg-ink text-brand' }
  else if (product.sold >= 4000) badge = { text: 'MÁS VENDIDO', cls: 'bg-warning text-white' }
  else if (product.stock <= 3) badge = { text: `ÚLTIMAS ${product.stock}`, cls: 'bg-red-500 text-white' }
  else if (product.rating >= 4.8 && product.reviewsCount > 50) badge = { text: 'RECOMENDADO', cls: 'bg-primary/15 text-primary' }
  if (!badge) return null
  return <span className={`w-fit rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${badge.cls}`}>{badge.text}</span>
}

function Rating({ product, size = 12 }: { product: Product; size?: number }) {
  if (!product.reviewsCount) return <p className="text-xs text-neutral-400">Sin opiniones todavía</p>
  return (
    <p className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
      {product.rating} <Stars rating={product.rating} size={size} /> ({product.reviewsCount})
    </p>
  )
}

/** Vertical card used on the home page carousels and grids. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/producto/${product.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-md bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <FavoriteButton productId={product.id} className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100" />
      <ProductImage product={product} className="aspect-square border-b border-neutral-100 transition group-hover:brightness-105" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <ProductBadge product={product} />
        <h3 className="line-clamp-2 text-sm text-neutral-700">{product.title}</h3>
        <Rating product={product} size={11} />
        <Price product={product} />
        <ShippingBadge product={product} />
      </div>
    </Link>
  )
}

/** Horizontal row used on the search results page. */
export function ProductListItem({ product }: { product: Product }) {
  const { compare, toggleCompare } = useStore()
  const comparing = compare.includes(product.id)
  return (
    <Link
      to={`/producto/${product.id}`}
      className="group relative flex gap-4 border-b border-neutral-200 bg-surface p-4 transition last:border-0 hover:bg-neutral-50 sm:gap-6 sm:p-5"
    >
      <ProductImage product={product} className="size-28 shrink-0 rounded sm:size-40" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap gap-1.5">
          <ProductBadge product={product} />
          {product.condition === 'usado' && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">Usado</span>}
        </div>
        <h2 className="pr-10 text-base text-neutral-800 sm:text-lg">{product.title}</h2>
        <p className="text-xs text-neutral-500">Por {product.seller}</p>
        <div className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          <Rating product={product} /> · {formatSold(product.sold)}
        </div>
        <Price product={product} />
        <ShippingBadge product={product} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            toggleCompare(product.id)
          }}
          aria-pressed={comparing}
          className={`mt-1 inline-flex items-center gap-1 text-xs ${comparing ? 'font-semibold text-primary' : 'text-neutral-500 hover:text-primary'}`}
        >
          <GitCompareArrows size={14} /> {comparing ? 'En el comparador' : 'Comparar'}
        </button>
      </div>
      <FavoriteButton productId={product.id} className="absolute right-4 top-4" />
    </Link>
  )
}
