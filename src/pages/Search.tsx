import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { ProductListItem } from '../components/ProductCard'
import { categories, categoryById } from '../data/categories'
import { products } from '../data/products'
import { formatPrice } from '../lib/format'
import { parseSearchParams, searchProducts, type SortOption } from '../lib/search'

const priceRanges = [
  { label: 'Hasta $ 50.000', max: 50000 },
  { label: '$ 50.000 a $ 300.000', min: 50000, max: 300000 },
  { label: 'Más de $ 300.000', min: 300000 },
]

interface Props {
  /** Restrict results to discounted products (used by /ofertas). */
  dealsOnly?: boolean
}

export default function Search({ dealsOnly = false }: Props) {
  const [sp, setSp] = useSearchParams()
  const params = useMemo(() => parseSearchParams(sp), [sp])
  const [showFilters, setShowFilters] = useState(false)

  const pool = useMemo(() => (dealsOnly ? products.filter((p) => p.originalPrice) : products), [dealsOnly])
  const results = useMemo(() => searchProducts(pool, params), [pool, params])
  // Counts for the category facet ignore the category filter itself.
  const categoryCounts = useMemo(() => {
    const base = searchProducts(pool, { ...params, category: undefined })
    return categories
      .map((c) => ({ ...c, count: base.filter((p) => p.category === c.id).length }))
      .filter((c) => c.count > 0)
  }, [pool, params])

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(changes)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    }
    setSp(next)
  }

  const applyCustomPrice = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    update({ min: String(data.get('min') ?? ''), max: String(data.get('max') ?? '') })
  }

  const title = params.query
    ? params.query
    : params.category
      ? categoryById[params.category]?.name
      : dealsOnly
        ? 'Ofertas'
        : 'Todos los productos'

  const chips: { label: string; clear: Record<string, undefined> }[] = []
  if (params.category) chips.push({ label: categoryById[params.category]?.name ?? params.category, clear: { category: undefined } })
  if (params.condition) chips.push({ label: params.condition === 'nuevo' ? 'Nuevo' : 'Usado', clear: { condition: undefined } })
  if (params.freeShipping) chips.push({ label: 'Envío gratis', clear: { free_shipping: undefined } })
  if (params.minPrice !== undefined || params.maxPrice !== undefined)
    chips.push({
      label: `${params.minPrice !== undefined ? formatPrice(params.minPrice) : '$ 0'} - ${params.maxPrice !== undefined ? formatPrice(params.maxPrice) : 'más'}`,
      clear: { min: undefined, max: undefined },
    })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 space-y-6 md:w-64">
          <div>
            {params.category && (
              <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: categoryById[params.category]?.name ?? '' }]} />
            )}
            <h1 className="mt-2 text-2xl font-semibold capitalize text-neutral-800">{title}</h1>
            <p className="text-sm text-neutral-500">{results.length} resultados</p>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} space-y-6 md:block`}>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update(chip.clear)}
                  className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-neutral-600 shadow-sm hover:bg-neutral-50"
                >
                  {chip.label} <X size={12} />
                </button>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between rounded-md bg-white p-4 text-sm shadow-sm">
            <span>
              <span className="font-semibold text-success">Envío gratis</span>
              <span className="block text-xs text-neutral-500">Miles de productos</span>
            </span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!params.freeShipping}
              onChange={(e) => update({ free_shipping: e.target.checked ? '1' : undefined })}
            />
            <span className="relative h-5 w-9 rounded-full bg-neutral-300 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
          </label>

          {!params.category && categoryCounts.length > 0 && (
            <FilterGroup title="Categorías">
              {categoryCounts.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => update({ category: c.id })} className="text-left hover:text-primary">
                    {c.name} <span className="text-neutral-400">({c.count})</span>
                  </button>
                </li>
              ))}
            </FilterGroup>
          )}

          {!params.condition && (
            <FilterGroup title="Condición">
              {(['nuevo', 'usado'] as const).map((cond) => {
                const count = searchProducts(pool, { ...params, condition: cond }).length
                return count > 0 ? (
                  <li key={cond}>
                    <button type="button" onClick={() => update({ condition: cond })} className="hover:text-primary">
                      {cond === 'nuevo' ? 'Nuevo' : 'Usado'} <span className="text-neutral-400">({count})</span>
                    </button>
                  </li>
                ) : null
              })}
            </FilterGroup>
          )}

          <FilterGroup title="Precio">
            {priceRanges.map((r) => (
              <li key={r.label}>
                <button
                  type="button"
                  onClick={() => update({ min: r.min?.toString(), max: r.max?.toString() })}
                  className="hover:text-primary"
                >
                  {r.label}
                </button>
              </li>
            ))}
            <li>
              <form onSubmit={applyCustomPrice} className="mt-2 flex items-center gap-2">
                <input name="min" type="number" min={0} placeholder="Mínimo" aria-label="Precio mínimo" defaultValue={params.minPrice} className="w-20 rounded-full border border-neutral-300 px-3 py-1 text-xs" />
                <span>-</span>
                <input name="max" type="number" min={0} placeholder="Máximo" aria-label="Precio máximo" defaultValue={params.maxPrice} className="w-20 rounded-full border border-neutral-300 px-3 py-1 text-xs" />
                <button type="submit" aria-label="Aplicar precio" className="grid size-7 place-items-center rounded-full bg-neutral-300 text-white hover:bg-primary">›</button>
              </form>
            </li>
          </FilterGroup>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-1 text-sm text-primary md:hidden"
            >
              <SlidersHorizontal size={16} /> {showFilters ? 'Ocultar filtros' : 'Filtrar'}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-neutral-600">Ordenar por</span>
              <select
                value={params.sort}
                onChange={(e) => update({ sort: e.target.value === 'relevance' ? undefined : (e.target.value as SortOption) })}
                className="rounded bg-transparent font-medium outline-none"
              >
                <option value="relevance">Más relevantes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </label>
          </div>

          {results.length > 0 ? (
            <div className="overflow-hidden rounded-md shadow-sm">
              {results.map((prod) => (
                <ProductListItem key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-700">No hay publicaciones que coincidan con tu búsqueda.</h2>
              <ul className="mx-auto mt-4 max-w-sm list-disc space-y-1 text-left text-sm text-neutral-600">
                <li>Revisá la ortografía de la palabra.</li>
                <li>Utilizá palabras más genéricas o menos palabras.</li>
                <li>
                  <Link to={dealsOnly ? '/ofertas' : '/buscar'} className="text-primary hover:underline">Quitá los filtros</Link> para ver más resultados.
                </li>
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-neutral-800">{title}</h3>
      <ul className="space-y-1.5 text-sm text-neutral-600">{children}</ul>
    </div>
  )
}
