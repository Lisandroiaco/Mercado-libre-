import { ShoppingCart, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/format'
import { FreeShippingBar } from './FreeShippingBar'
import { ProductImage } from './ProductImage'

/** Side panel that opens after adding to the cart, so shoppers can keep browsing. */
export function CartDrawer() {
  const { cartOpen, setCartOpen, summary, dispatch } = useStore()

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  if (!cartOpen) return null
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Cerrar carrito" className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-label="Carrito" className="animate-drawer absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-200 p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShoppingCart size={18} /> Carrito ({summary.count})
          </h2>
          <button type="button" aria-label="Cerrar" onClick={() => setCartOpen(false)} className="rounded p-1 hover:bg-neutral-100">
            <X size={20} />
          </button>
        </header>
        <div className="border-b border-neutral-200 p-4">
          <FreeShippingBar missing={summary.missingForFreeShipping} />
        </div>
        <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto">
          {summary.lines.map((l) => (
            <li key={`${l.product.id}-${l.variant}`} className="flex gap-3 p-4">
              <ProductImage product={l.product} className="size-16 shrink-0 rounded" showBrand={false} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm">{l.product.title}</p>
                {l.variant && <p className="text-xs text-neutral-500">{l.variant}</p>}
                <p className="text-xs text-neutral-500">Cantidad: {l.quantity}</p>
                <p className="font-medium">{formatPrice(l.subtotal)}</p>
              </div>
              <button
                type="button"
                aria-label={`Eliminar ${l.product.title}`}
                onClick={() => dispatch({ type: 'remove', productId: l.product.id, variant: l.variant })}
                className="self-start p-1 text-neutral-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {summary.lines.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">Tu carrito está vacío.</li>}
        </ul>
        {summary.lines.length > 0 && (
          <footer className="space-y-3 border-t border-neutral-200 p-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(summary.grandTotal)}</span>
            </div>
            <Link to="/checkout" onClick={() => setCartOpen(false)} className="block rounded-md bg-primary py-3 text-center font-semibold text-white hover:bg-primary-dark">
              Comprar ahora
            </Link>
            <Link to="/carrito" onClick={() => setCartOpen(false)} className="block rounded-md bg-primary/10 py-3 text-center font-semibold text-primary hover:bg-primary/20">
              Ver carrito
            </Link>
          </footer>
        )}
      </aside>
    </div>
  )
}
