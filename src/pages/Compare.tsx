import { GitCompareArrows, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { Stars } from '../components/Stars'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/format'
import type { Product } from '../types'

export default function Compare() {
  const { compare, toggleCompare, lookup, dispatch, setCartOpen } = useStore()
  const items = compare.map((id) => lookup.get(id)).filter((p): p is Product => !!p)
  const attrKeys = [...new Set(items.flatMap((p) => Object.keys(p.attributes)))]
  const cheapest = Math.min(...items.map((p) => p.price))
  const bestRated = Math.max(...items.map((p) => p.rating))

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col items-center gap-3 rounded-md bg-surface p-12 text-center shadow-sm">
          <GitCompareArrows size={48} strokeWidth={1} className="text-neutral-300" />
          <h1 className="text-xl font-semibold">Compará hasta 3 productos</h1>
          <p className="text-sm text-neutral-500">Tocá "Comparar" en los resultados de búsqueda o en un producto.</p>
          <Link to="/buscar?category=celulares" className="text-primary hover:underline">Empezar con celulares</Link>
        </div>
      </div>
    )
  }

  const rows: { label: string; render: (p: Product) => ReactNode }[] = [
    { label: 'Precio', render: (p) => <span className={p.price === cheapest && items.length > 1 ? 'font-semibold text-success' : ''}>{formatPrice(p.price)}{p.price === cheapest && items.length > 1 ? ' · el más barato' : ''}</span> },
    { label: 'Calificación', render: (p) => <span className="flex items-center gap-1">{p.rating} <Stars rating={p.rating} size={12} />{p.rating === bestRated && items.length > 1 && <span className="text-xs font-semibold text-primary">mejor</span>}</span> },
    { label: 'Condición', render: (p) => (p.condition === 'nuevo' ? 'Nuevo' : 'Usado') },
    { label: 'Envío', render: (p) => (p.freeShipping ? <span className="text-success">Gratis{p.fullShipping ? ' · FULL' : ''}</span> : 'Con costo') },
    { label: 'Cuotas sin interés', render: (p) => p.installments },
    { label: 'Vendidos', render: (p) => p.sold.toLocaleString('es-AR') },
    ...attrKeys.map((k) => ({ label: k, render: (p: Product) => p.attributes[k] ?? '—' })),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Comparar productos</h1>
      <div className="overflow-x-auto rounded-md bg-surface shadow-sm">
        <table className="w-full min-w-[640px] table-fixed text-sm">
          <thead>
            <tr>
              <th className="w-40 p-4" />
              {items.map((p) => (
                <th key={p.id} className="p-4 text-left align-top font-normal">
                  <div className="relative space-y-2">
                    <button type="button" aria-label={`Quitar ${p.title}`} onClick={() => toggleCompare(p.id)} className="absolute right-0 top-0 rounded-full bg-surface p-1 shadow">
                      <X size={14} />
                    </button>
                    <ProductImage product={p} className="aspect-square w-full max-w-40 rounded" showBrand={false} />
                    <Link to={`/producto/${p.id}`} className="line-clamp-2 font-medium hover:text-primary">{p.title}</Link>
                    <Price product={p} />
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'add', productId: p.id, variant: p.variants?.options[0], quantity: 1, stock: p.stock })
                        setCartOpen(true)
                      }}
                      className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-neutral-100 odd:bg-neutral-50">
                <th scope="row" className="p-4 text-left font-medium text-neutral-600">{row.label}</th>
                {items.map((p) => <td key={p.id} className="p-4">{row.render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
