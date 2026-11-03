import { LayoutGrid, List, SlidersHorizontal, Star, X, Zap } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { Countdown } from '../components/Countdown'
import { Pagination } from '../components/Pagination'
import { ProductCard, ProductListItem } from '../components/ProductCard'
import { useStore } from '../context/store'
import { categories, categoryById } from '../data/categories'
import { formatPrice } from '../lib/format'
import { didYouMean, parseSearchParams, searchProducts, sortLabels, type SearchParams, type SortOption } from '../lib/search'
import { useLocalStorage } from '../lib/useLocalStorage'

const PAGE_SIZE = 12

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
  const { catalog } = useStore()
  const [sp, setSp] = useSearchParams()
  const params = useMemo(() => parseSearchParams(sp), [sp])
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useLocalStorage<'list' | 'grid'>('mercadito:view', 'list')
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const pool = useMemo(() => (dealsOnly ? catalog.filter((p) => p.originalPrice) : catalog), [dealsOnly, catalog])
  const results = useMemo(() => searchProducts(pool, params), [pool, params])
  const pages = Math.ceil(results.length / PAGE_SIZE)
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const suggestion = useMemo(
    () => (results.length === 0 && params.query ? didYouMean(params.query, catalog) : undefined),
    [results.length, params.query, catalog],
  )

  /** Counts for a facet are computed with every other filter applied but that one. */
  const facet = <K extends keyof SearchParams>(key: K) => searchProducts(pool, { ...params, [key]: undefined })
  const categoryCounts = categories
    .map((c) => ({ ...c, count: facet('category').filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0)
  const brandCounts = Object.entries(
    facet('brand').reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.brand]: (acc[p.brand] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(changes)) {
      if (v === undefined || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!('page' in changes)) next.delete('page')
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
  if (params.brand) chips.push({ label: params.brand, clear: { brand: undefined } })
  if (params.condition) chips.push({ label: params.condition === 'nuevo' ? 'Nuevo' : 'Usado', clear: { condition: undefined } })
  if (params.freeShipping) chips.push({ label: 'Envío gratis', clear: { free_shipping: undefined } })
  if (params.full) chips.push({ label: 'FULL', clear: { full: undefined } })
  if (params.minRating) chips.push({ label: `${params.minRating}★ o más`, clear: { rating: undefined } })
  if (params.minPrice !== undefined || params.maxPrice !== undefined)
    chips.push({
      label: `${params.minPrice !== undefined ? formatPrice(params.minPrice) : '$ 0'} - ${params.maxPrice !== undefined ? formatPrice(params.maxPrice) : 'más'}`,
      clear: { min: undefined, max: undefined },
    })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {dealsOnly && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-gradient-to-r from-primary to-ink p-5 text-white shadow-sm dark:to-primary-dark">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
              <Zap size={14} className="fill-brand text-brand" /> Ofertas del día
            </p>
            <p className="text-lg font-semibold">Descuentos que se renuevan todos los días a la medianoche</p>
          </div>
          <div className="text-sm">
            Terminan en <Countdown className="ml-1 text-base" />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 space-y-6 md:w-64">
          <div>
            {params.category && <Breadcrumb items={[{ label: 'Inicio', to: '/' }, { label: categoryById[params.category]?.name ?? '' }]} />}
            <h1 className="mt-2 text-2xl font-semibold capitalize text-neutral-800">{title}</h1>
            <p className="text-sm text-neutral-500">{results.length} resultados</p>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} space-y-6 md:block`}>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <button key={chip.label} type="button" onClick={() => update(chip.clear)} className="flex items-center gap-1 rounded bg-surface px-2 py-1 text-xs text-neutral-600 shadow-sm hover:bg-neutral-50">
                    {chip.label} <X size={12} />
                  </button>
                ))}
                <Link to={dealsOnly ? '/ofertas' : `/buscar${params.query ? `?q=${encodeURIComponent(params.query)}` : ''}`} className="px-1 py-1 text-xs text-primary hover:underline">
                  Limpiar filtros
                </Link>
              </div>
            )}

            <div className="space-y-px overflow-hidden rounded-md shadow-sm">
              <Toggle label={<span className="font-semibold text-success">Envío gratis</span>} hint="Miles de productos" checked={!!params.freeShipping} onChange={(v) => update({ free_shipping: v ? '1' : undefined })} />
              <Toggle
                label={<span className="flex items-center font-bold italic text-success"><Zap size={13} className="fill-success" />FULL</span>}
                hint="Llegan más rápido"
                checked={!!params.full}
                onChange={(v) => update({ full: v ? '1' : undefined })}
              />
            </div>

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

            {!params.brand && brandCounts.length > 1 && (
              <FilterGroup title="Marca">
                {brandCounts.slice(0, 8).map(([brand, count]) => (
                  <li key={brand}>
                    <button type="button" onClick={() => update({ brand })} className="text-left hover:text-primary">
                      {brand} <span className="text-neutral-400">({count})</span>
                    </button>
                  </li>
                ))}
              </FilterGroup>
            )}

            {!params.condition && (
              <FilterGroup title="Condición">
                {(['nuevo', 'usado'] as const).map((cond) => {
                  const count = facet('condition').filter((p) => p.condition === cond).length
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

            {!params.minRating && (
              <FilterGroup title="Calificación">
                {[4.5, 4].map((r) => (
                  <li key={r}>
                    <button type="button" onClick={() => update({ rating: String(r) })} className="flex items-center gap-1 hover:text-primary">
                      <Star size={14} className="fill-primary text-primary" /> {r} o más
                      <span className="text-neutral-400">({facet('minRating').filter((p) => p.rating >= r).length})</span>
                    </button>
                  </li>
                ))}
              </FilterGroup>
            )}

            <FilterGroup title="Precio">
              {priceRanges.map((r) => (
                <li key={r.label}>
                  <button type="button" onClick={() => update({ min: r.min?.toString(), max: r.max?.toString() })} className="hover:text-primary">
                    {r.label}
                  </button>
                </li>
              ))}
              <li>
                <form onSubmit={applyCustomPrice} className="mt-2 flex items-center gap-2">
                  <input name="min" type="number" min={0} placeholder="Mínimo" aria-label="Precio mínimo" defaultValue={params.minPrice} className="w-20 rounded-full border border-neutral-300 bg-surface px-3 py-1 text-xs" />
                  <span>-</span>
                  <input name="max" type="number" min={0} placeholder="Máximo" aria-label="Precio máximo" defaultValue={params.maxPrice} className="w-20 rounded-full border border-neutral-300 bg-surface px-3 py-1 text-xs" />
                  <button type="submit" aria-label="Aplicar precio" className="grid size-7 place-items-center rounded-full bg-neutral-300 text-white hover:bg-primary">›</button>
                </form>
              </li>
            </FilterGroup>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1 text-sm text-primary md:hidden">
              <SlidersHorizontal size={16} /> {showFilters ? 'Ocultar filtros' : `Filtrar${chips.length ? ` (${chips.length})` : ''}`}
            </button>
            <div className="ml-auto flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-neutral-600">Ordenar por</span>
                <select
                  value={params.sort}
                  onChange={(e) => update({ sort: e.target.value === 'relevance' ? undefined : (e.target.value as SortOption) })}
                  className="rounded bg-transparent font-medium outline-none"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <div className="flex rounded-md bg-surface p-0.5 shadow-sm" role="group" aria-label="Vista">
                {([['list', List], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={v === 'list' ? 'Ver como lista' : 'Ver como grilla'}
                    className={`rounded p-1.5 ${view === v ? 'bg-primary/15 text-primary' : 'text-neutral-500'}`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {results.length > 0 ? (
            view === 'list' ? (
              <div className="overflow-hidden rounded-md shadow-sm">
                {visible.map((prod) => <ProductListItem key={prod.id} product={prod} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((prod) => <ProductCard key={prod.id} product={prod} />)}
              </div>
            )
          ) : (
            <div className="rounded-md bg-surface p-10 text-center shadow-sm">
              {suggestion && (
                <p className="mb-4 text-lg">
                  ¿Quisiste decir{' '}
                  <Link to={`/buscar?q=${encodeURIComponent(suggestion)}`} className="font-semibold italic text-primary hover:underline">
                    {suggestion}
                  </Link>
                  ?
                </p>
              )}
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
          <Pagination
            page={Math.min(page, pages)}
            pages={pages}
            onChange={(n) => {
              update({ page: n === 1 ? undefined : String(n) })
              window.scrollTo({ top: 0 })
            }}
          />
        </section>
      </div>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: ReactNode; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between bg-surface p-4 text-sm">
      <span>
        {label}
        <span className="block text-xs text-neutral-500">{hint}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-neutral-300 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
    </label>
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
