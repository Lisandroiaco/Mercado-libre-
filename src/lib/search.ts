import type { CategoryId, Product } from '../types'

export type SortOption = 'relevance' | 'price_asc' | 'price_desc'

export interface SearchParams {
  query?: string
  category?: CategoryId
  minPrice?: number
  maxPrice?: number
  freeShipping?: boolean
  condition?: Product['condition']
  sort?: SortOption
}

/** Lowercases and strips accents so "televisión" matches "television". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function matchesQuery(product: Product, query: string): boolean {
  const haystack = normalize(`${product.title} ${product.brand} ${product.category}`)
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

export function searchProducts(products: Product[], params: SearchParams): Product[] {
  const { query, category, minPrice, maxPrice, freeShipping, condition, sort = 'relevance' } = params

  const results = products.filter(
    (prod) =>
      (!query || matchesQuery(prod, query)) &&
      (!category || prod.category === category) &&
      (minPrice === undefined || prod.price >= minPrice) &&
      (maxPrice === undefined || prod.price <= maxPrice) &&
      (!freeShipping || prod.freeShipping) &&
      (!condition || prod.condition === condition),
  )

  if (sort === 'price_asc') return results.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return results.sort((a, b) => b.price - a.price)
  // "Relevance": best-selling first.
  return results.sort((a, b) => b.sold - a.sold)
}

/** Parses URLSearchParams into SearchParams, ignoring invalid values. */
export function parseSearchParams(sp: URLSearchParams): SearchParams {
  const num = (key: string) => {
    const raw = sp.get(key)
    if (raw === null || raw === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  const condition = sp.get('condition')
  const sort = sp.get('sort')
  return {
    query: sp.get('q') ?? undefined,
    category: (sp.get('category') as CategoryId | null) ?? undefined,
    minPrice: num('min'),
    maxPrice: num('max'),
    freeShipping: sp.get('free_shipping') === '1',
    condition: condition === 'nuevo' || condition === 'usado' ? condition : undefined,
    sort: sort === 'price_asc' || sort === 'price_desc' ? sort : 'relevance',
  }
}
