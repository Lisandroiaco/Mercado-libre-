import { BadgeCheck, Clock, MapPin, ThumbsUp } from 'lucide-react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../context/store'
import NotFound from './NotFound'

export default function Seller() {
  const { name = '' } = useParams()
  const { catalog } = useStore()
  const items = useMemo(() => catalog.filter((p) => p.seller === name), [catalog, name])
  if (items.length === 0) return <NotFound />
  const sold = items.reduce((s, p) => s + p.sold, 0)
  const rated = items.filter((p) => p.reviewsCount > 0)
  const rating = rated.length ? rated.reduce((s, p) => s + p.rating, 0) / rated.length : 0
  const official = name.includes('TIENDA OFICIAL')

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="overflow-hidden rounded-md bg-surface shadow-sm">
        <div className="h-24 bg-gradient-to-r from-ink to-primary" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-6">
          <span className="-mt-10 grid size-20 place-items-center rounded-full border-4 border-surface bg-brand text-2xl font-extrabold text-ink">{name[0]}</span>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              {name} {official && <BadgeCheck className="text-primary" size={20} aria-label="Tienda oficial" />}
            </h1>
            <p className="flex items-center gap-1 text-sm text-neutral-500"><MapPin size={14} /> {items[0].location}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px border-t border-neutral-100 bg-neutral-100 sm:grid-cols-4">
          {[
            { icon: ThumbsUp, label: 'Calificación', value: rating ? rating.toFixed(1) : '—' },
            { icon: BadgeCheck, label: 'Ventas', value: sold.toLocaleString('es-AR') },
            { icon: Clock, label: 'Despacha', value: 'En 24 h' },
            { icon: MapPin, label: 'Publicaciones', value: items.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-surface p-4">
              <Icon size={20} className="text-primary" />
              <div>
                <dt className="text-xs text-neutral-500">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
      <h2 className="text-xl font-semibold">Productos del vendedor</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
