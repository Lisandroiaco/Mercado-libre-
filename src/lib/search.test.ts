import { products } from '../data/products'
import { parseSearchParams, searchProducts } from './search'

describe('searchProducts', () => {
  it('matches every word, ignoring accents and case', () => {
    const results = searchProducts(products, { query: 'NOTEBOOK lenovo' })
    expect(results.map((p) => p.id)).toEqual(['MLA-2001'])
    expect(searchProducts(products, { query: 'mecanico' }).length).toBe(1)
  })

  it('filters by category, price, shipping and condition', () => {
    const results = searchProducts(products, {
      category: 'celulares',
      minPrice: 300000,
      maxPrice: 1500000,
      freeShipping: true,
      condition: 'nuevo',
    })
    expect(results.length).toBeGreaterThan(0)
    for (const p of results) {
      expect(p.category).toBe('celulares')
      expect(p.price).toBeGreaterThanOrEqual(300000)
      expect(p.price).toBeLessThanOrEqual(1500000)
      expect(p.freeShipping).toBe(true)
    }
  })

  it('sorts by price', () => {
    const asc = searchProducts(products, { sort: 'price_asc' }).map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const desc = searchProducts(products, { sort: 'price_desc' }).map((p) => p.price)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('does not mutate the input array', () => {
    const copy = [...products]
    searchProducts(products, { sort: 'price_asc' })
    expect(products).toEqual(copy)
  })
})

describe('parseSearchParams', () => {
  it('parses valid params and drops invalid ones', () => {
    const params = parseSearchParams(new URLSearchParams('q=tv&min=10&max=abc&condition=roto&sort=price_desc&free_shipping=1'))
    expect(params).toMatchObject({ query: 'tv', minPrice: 10, maxPrice: undefined, condition: undefined, sort: 'price_desc', freeShipping: true })
  })
})
