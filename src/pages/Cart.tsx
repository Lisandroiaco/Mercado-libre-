import { Minus, Plus, ShoppingCart, Tag, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FreeShippingBar } from '../components/FreeShippingBar'
import { ProductImage } from '../components/ProductImage'
import { ProductRow } from '../components/ProductRow'
import { ShippingBadge } from '../components/ShippingBadge'
import { useStore } from '../context/store'
import { validateCoupon } from '../lib/coupons'
import { formatPrice } from '../lib/format'
import type { Product } from '../types'

export default function Cart() {
  const { summary, dispatch, saved, saveForLater, moveToCart, removeSaved, lookup, catalog } = useStore()
  const navigate = useNavigate()
  const savedLines = saved.flatMap((item) => {
    const product = lookup.get(item.productId)
    return product ? [{ item, product }] : []
  })
  const inCart = new Set(summary.lines.map((l) => l.product.id))
  const recommendations = catalog.filter((p) => !inCart.has(p.id) && p.price < 60000).sort((a, b) => b.sold - a.sold).slice(0, 10)

  if (summary.lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-md bg-surface p-12 text-center shadow-sm">
          <ShoppingCart size={56} strokeWidth={1} className="text-neutral-300" />
          <h1 className="text-xl font-semibold text-neutral-700">Tu carrito está vacío</h1>
          <p className="text-sm text-neutral-500">Sumá productos y conseguí envío gratis.</p>
          <Link to="/" className="mt-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Descubrir productos</Link>
        </div>
        <SavedList lines={savedLines} onMove={moveToCart} onRemove={removeSaved} />
        <ProductRow title="Te puede interesar" products={recommendations} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-md bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 p-5">
              <h1 className="text-lg font-semibold">Carrito ({summary.count})</h1>
              <button type="button" onClick={() => dispatch({ type: 'clear' })} className="text-sm text-primary hover:underline">Vaciar carrito</button>
            </div>
            <div className="border-b border-neutral-100 p-5">
              <FreeShippingBar missing={summary.missingForFreeShipping} />
            </div>
            <ul>
              {summary.lines.map(({ product, quantity, subtotal, variant }) => (
                <li key={`${product.id}-${variant}`} className="flex flex-wrap gap-4 border-b border-neutral-100 p-5 last:border-0 sm:flex-nowrap">
                  <Link to={`/producto/${product.id}`}>
                    <ProductImage product={product} className="size-20 rounded" showBrand={false} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/producto/${product.id}`} className="font-medium text-neutral-800 hover:text-primary">{product.title}</Link>
                    {variant && <p className="text-sm text-neutral-500">{product.variants?.name}: {variant}</p>}
                    <ShippingBadge product={product} />
                    <div className="mt-1 flex gap-4 text-sm">
                      <button type="button" onClick={() => dispatch({ type: 'remove', productId: product.id, variant })} className="text-primary hover:underline">Eliminar</button>
                      <button type="button" onClick={() => saveForLater({ productId: product.id, variant, quantity })} className="text-primary hover:underline">Guardar para después</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center rounded border border-neutral-300">
                      <button
                        type="button"
                        aria-label="Restar uno"
                        disabled={quantity <= 1}
                        onClick={() => dispatch({ type: 'update', productId: product.id, variant, quantity: quantity - 1, stock: product.stock })}
                        className="grid size-8 place-items-center text-primary disabled:text-neutral-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm" aria-label="Cantidad">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Sumar uno"
                        disabled={quantity >= product.stock}
                        onClick={() => dispatch({ type: 'update', productId: product.id, variant, quantity: quantity + 1, stock: product.stock })}
                        className="grid size-8 place-items-center text-primary disabled:text-neutral-300"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-neutral-400">{product.stock} disp.</span>
                  </div>
                  <p className="w-32 text-right text-lg">{formatPrice(subtotal)}</p>
                </li>
              ))}
            </ul>
          </section>
          <SavedList lines={savedLines} onMove={moveToCart} onRemove={removeSaved} />
        </div>

        <OrderSummary>
          <CouponForm />
          <button type="button" onClick={() => navigate('/checkout')} className="w-full rounded-md bg-primary py-3 font-semibold text-white hover:bg-primary-dark">
            Continuar compra
          </button>
        </OrderSummary>
      </div>
      <ProductRow title="Sumá a tu compra" products={recommendations} />
    </div>
  )
}

type SavedLine = { item: { productId: string; variant?: string; quantity: number }; product: Product }

function SavedList({ lines, onMove, onRemove }: { lines: SavedLine[]; onMove: (i: SavedLine['item']) => void; onRemove: (i: SavedLine['item']) => void }) {
  if (lines.length === 0) return null
  return (
    <section className="rounded-md bg-surface shadow-sm">
      <h2 className="border-b border-neutral-100 p-5 text-lg font-semibold">Guardados ({lines.length})</h2>
      <ul>
        {lines.map(({ item, product }) => (
          <li key={`${product.id}-${item.variant}`} className="flex items-center gap-4 border-b border-neutral-100 p-5 last:border-0">
            <ProductImage product={product} className="size-16 shrink-0 rounded" showBrand={false} />
            <div className="min-w-0 flex-1">
              <Link to={`/producto/${product.id}`} className="text-sm hover:text-primary">{product.title}</Link>
              <div className="mt-1 flex gap-4 text-sm">
                <button type="button" onClick={() => onMove(item)} className="text-primary hover:underline">Mover al carrito</button>
                <button type="button" onClick={() => onRemove(item)} className="text-primary hover:underline">Eliminar</button>
              </div>
            </div>
            <p className="text-right">{formatPrice(product.price)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CouponForm() {
  const { couponCode, setCouponCode, summary } = useStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const apply = (e: FormEvent) => {
    e.preventDefault()
    const result = validateCoupon(code, summary.total)
    if (!result.ok) return setError(result.error)
    setCouponCode(result.coupon.code)
    setCode('')
    setError('')
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between rounded-md bg-success/10 px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-success">
          <Tag size={14} /> {couponCode}
        </span>
        <button type="button" aria-label="Quitar cupón" onClick={() => setCouponCode(null)} className="text-neutral-500 hover:text-neutral-800">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={apply} className="space-y-1">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de cupón"
          aria-label="Código de cupón"
          aria-invalid={!!error}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm uppercase outline-none placeholder:normal-case focus:border-primary"
        />
        <button type="submit" className="rounded-md px-3 text-sm font-semibold text-primary hover:bg-primary/10">Aplicar</button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : <p className="text-xs text-neutral-400">Probá con MERCADITO10</p>}
    </form>
  )
}

export function OrderSummary({ children, shippingOverride }: { children?: ReactNode; shippingOverride?: number }) {
  const { summary } = useStore()
  const shipping = shippingOverride ?? summary.shipping
  const total = summary.total + shipping - summary.discount
  return (
    <aside className="h-fit space-y-3 rounded-md bg-surface p-5 shadow-sm lg:sticky lg:top-32">
      <h2 className="border-b border-neutral-100 pb-3 font-semibold">Resumen de compra</h2>
      <div className="flex justify-between text-sm">
        <span>Productos ({summary.count})</span>
        <span>{formatPrice(summary.total)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Envío</span>
        {shipping === 0 ? <span className="text-success">Gratis</span> : <span>{formatPrice(shipping)}</span>}
      </div>
      {summary.discount > 0 && (
        <div className="flex justify-between text-sm text-success">
          <span>Cupón {summary.coupon?.code}</span>
          <span>- {formatPrice(summary.discount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-neutral-100 pt-3 text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      {children}
    </aside>
  )
}
