import type { CategoryId, Product } from '../types'

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | 'newest'

export const sortLabels: Record<SortOption, string> = {
  relevance: 'Más relevantes',
  price_asc: 'Menor precio',
  price_desc: 'Mayor precio',
  rating: 'Mejor calificados',
  discount: 'Mayor descuento',
  newest: 'Más nuevos',
}

export interface SearchParams {
  query?: string
  category?: CategoryId
  minPrice?: number
  maxPrice?: number
  freeShipping?: boolean
  condition?: Product['condition']
  brand?: string
  minRating?: number
  full?: boolean
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
  const { query, category, minPrice, maxPrice, freeShipping, condition, brand, minRating, full, sort = 'relevance' } = params

  const results = products.filter(
    (prod) =>
      (!query || matchesQuery(prod, query)) &&
      (!category || prod.category === category) &&
      (minPrice === undefined || prod.price >= minPrice) &&
      (maxPrice === undefined || prod.price <= maxPrice) &&
      (!freeShipping || prod.freeShipping) &&
      (!condition || prod.condition === condition) &&
      (!brand || prod.brand === brand) &&
      (!minRating || prod.rating >= minRating) &&
      (!full || prod.fullShipping),
  )

  if (sort === 'price_asc') return results.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return results.sort((a, b) => b.price - a.price)
  if (sort === 'rating') return results.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
  if (sort === 'discount') return results.sort((a, b) => discountOf(b) - discountOf(a))
  if (sort === 'newest') return results.sort((a, b) => b.id.localeCompare(a.id))
  // "Relevance": best-selling first.
  return results.sort((a, b) => b.sold - a.sold)
}

function discountOf(p: Product) {
  return p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0
}

/** Levenshtein edit distance, used for "¿Quisiste decir…?". */
export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}

/**
 * Suggests a corrected query by replacing each word with the closest word in the catalog.
 * Returns undefined when nothing better is found.
 */
export function didYouMean(query: string, products: Product[]): string | undefined {
  const vocab = new Set<string>()
  for (const p of products) for (const w of normalize(`${p.title} ${p.brand}`).split(/[^a-z0-9]+/)) if (w.length > 2) vocab.add(w)
  let changed = false
  const words = normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (vocab.has(word)) return word
      let best = word
      let bestDist = Math.max(1, Math.floor(word.length / 3)) + 1
      for (const candidate of vocab) {
        if (Math.abs(candidate.length - word.length) > 2) continue
        const d = editDistance(word, candidate)
        if (d < bestDist) {
          best = candidate
          bestDist = d
        }
      }
      if (best !== word) changed = true
      return best
    })
  return changed ? words.join(' ') : undefined
}

/** Products, categories and brands that match a partial query, for the search box. */
export function suggest(query: string, products: Product[], limit = 6): string[] {
  const q = normalize(query.trim())
  if (q.length < 2) return []
  const out = new Set<string>()
  for (const p of products) {
    if (normalize(p.brand).startsWith(q)) out.add(p.brand.toLowerCase())
  }
  for (const p of products) {
    const title = normalize(p.title)
    const idx = title.indexOf(q)
    if (idx === -1) continue
    // Suggest the title up to a few words after the match, like real search boxes do.
    const words = p.title.toLowerCase().split(' ')
    const start = normalize(p.title.toLowerCase()).slice(0, idx).split(' ').length - 1
    out.add(words.slice(0, Math.min(words.length, start + 3)).join(' '))
    if (out.size >= limit) break
  }
  return [...out].slice(0, limit)
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
  const sort = sp.get('sort') as SortOption | null
  return {
    query: sp.get('q') ?? undefined,
    category: (sp.get('category') as CategoryId | null) ?? undefined,
    minPrice: num('min'),
    maxPrice: num('max'),
    freeShipping: sp.get('free_shipping') === '1',
    condition: condition === 'nuevo' || condition === 'usado' ? condition : undefined,
    brand: sp.get('brand') ?? undefined,
    minRating: num('rating'),
    full: sp.get('full') === '1',
    sort: sort && sort in sortLabels ? sort : 'relevance',
  }
}
