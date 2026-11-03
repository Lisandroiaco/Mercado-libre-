import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../context/store'
import { productById } from '../data/products'
import type { Product } from '../types'

/** Grid of products from a stored list of ids: favorites or browsing history. */
export default function Collection({ kind }: { kind: 'favorites' | 'history' }) {
  const store = useStore()
  const ids = kind === 'favorites' ? store.favorites : store.history
  const items = ids.map((id) => productById.get(id)).filter((p): p is Product => !!p)
  const title = kind === 'favorites' ? 'Favoritos' : 'Historial de navegación'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-800">{title}</h1>
      {items.length === 0 ? (
        <div className="rounded-md bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-neutral-700">
            {kind === 'favorites' ? 'Todavía no agregaste favoritos.' : 'Todavía no viste ningún producto.'}
          </p>
          <Link to="/" className="mt-3 inline-block text-primary hover:underline">Ir a la página principal</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
