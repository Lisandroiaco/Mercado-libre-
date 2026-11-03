import { Minus, Plus, ShoppingCart } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductImage } from '../components/ProductImage'
import { ShippingBadge } from '../components/ShippingBadge'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/format'

export default function Cart() {
  const { summary, dispatch } = useStore()
  const navigate = useNavigate()

  if (summary.lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col items-center gap-3 rounded-md bg-white p-12 text-center shadow-sm">
          <ShoppingCart size={56} strokeWidth={1} className="text-neutral-300" />
          <h1 className="text-xl font-semibold text-neutral-700">Tu carrito está vacío</h1>
          <p className="text-sm text-neutral-500">Sumá productos y conseguí envío gratis.</p>
          <Link to="/" className="mt-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
            Descubrir productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <h1 className="text-lg font-semibold">Carrito ({summary.count})</h1>
          <button type="button" onClick={() => dispatch({ type: 'clear' })} className="text-sm text-primary hover:underline">
            Vaciar carrito
          </button>
        </div>
        <ul>
          {summary.lines.map(({ product, quantity, subtotal }) => (
            <li key={product.id} className="flex flex-wrap gap-4 border-b border-neutral-100 p-5 last:border-0 sm:flex-nowrap">
              <Link to={`/producto/${product.id}`}>
                <ProductImage product={product} className="size-20 rounded" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/producto/${product.id}`} className="font-medium text-neutral-800 hover:text-primary">
                  {product.title}
                </Link>
                <ShippingBadge product={product} />
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'remove', productId: product.id })}
                  className="mt-1 text-sm text-primary hover:underline"
                >
                  Eliminar
                </button>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center rounded border border-neutral-300">
                  <button
                    type="button"
                    aria-label="Restar uno"
                    disabled={quantity <= 1}
                    onClick={() => dispatch({ type: 'update', productId: product.id, quantity: quantity - 1, stock: product.stock })}
                    className="grid size-8 place-items-center text-primary disabled:text-neutral-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm" aria-label="Cantidad">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Sumar uno"
                    disabled={quantity >= product.stock}
                    onClick={() => dispatch({ type: 'update', productId: product.id, quantity: quantity + 1, stock: product.stock })}
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

      <OrderSummary>
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="w-full rounded-md bg-primary py-3 font-semibold text-white hover:bg-primary-dark"
        >
          Continuar compra
        </button>
      </OrderSummary>
    </div>
  )
}

export function OrderSummary({ children }: { children?: ReactNode }) {
  const { summary } = useStore()
  return (
    <aside className="h-fit space-y-3 rounded-md bg-white p-5 shadow-sm">
      <h2 className="border-b border-neutral-100 pb-3 font-semibold">Resumen de compra</h2>
      <div className="flex justify-between text-sm">
        <span>Productos ({summary.count})</span>
        <span>{formatPrice(summary.total)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Envío</span>
        {summary.shipping === 0 ? <span className="text-success">Gratis</span> : <span>{formatPrice(summary.shipping)}</span>}
      </div>
      <div className="flex justify-between border-t border-neutral-100 pt-3 text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(summary.grandTotal)}</span>
      </div>
      {children}
    </aside>
  )
}
