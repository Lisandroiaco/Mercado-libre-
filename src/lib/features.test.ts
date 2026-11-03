import { products, priceHistory, createListing } from '../data/products'
import { detectBrand, expiryValid, formatCardNumber, luhnValid, validateCard } from './card'
import { cartReducer, cartSummary } from './cart'
import { coupons, validateCoupon } from './coupons'
import { buildOrder, orderStage } from './orders'
import { didYouMean, editDistance, searchProducts, suggest } from './search'
import { arrivalLabel, quoteShipping, regionForZip } from './shipping'
import { emptyDraft, validateDraft } from './validation'

const lookup = new Map(products.map((p) => [p.id, p]))

describe('card', () => {
  it('validates numbers with Luhn', () => {
    expect(luhnValid('4509 9535 6623 3704')).toBe(true)
    expect(luhnValid('4509 9535 6623 3705')).toBe(false)
    expect(luhnValid('123')).toBe(false)
  })
  it('detects the network and formats as you type', () => {
    expect(detectBrand('4509')).toBe('visa')
    expect(detectBrand('5500 0000')).toBe('mastercard')
    expect(detectBrand('3714')).toBe('amex')
    expect(formatCardNumber('4509953566233704')).toBe('4509 9535 6623 3704')
    expect(formatCardNumber('371449635398431')).toBe('3714 496353 98431')
  })
  it('rejects past or malformed expiry dates', () => {
    const now = new Date(2026, 10, 3)
    expect(expiryValid('11/26', now)).toBe(true)
    expect(expiryValid('10/26', now)).toBe(false)
    expect(expiryValid('13/30', now)).toBe(false)
  })
  it('requires 4-digit CVV for Amex', () => {
    const errs = validateCard({ number: '371449635398431', name: 'Ada L', expiry: '12/30', cvv: '123' }, new Date(2026, 0, 1))
    expect(Object.keys(errs)).toEqual(['cvv'])
  })
})

describe('coupons', () => {
  it('applies percentage coupons with a cap', () => {
    const c = coupons.find((x) => x.code === 'MERCADITO10')!
    expect(c.discount(100000)).toBe(10000)
    expect(c.discount(2000000)).toBe(50000)
  })
  it('validates codes case-insensitively and checks minimums', () => {
    expect(validateCoupon('mercadito10', 100).ok).toBe(true)
    expect(validateCoupon('NOEXISTE', 100).ok).toBe(false)
    expect(validateCoupon('BIENVENIDA', 1000).ok).toBe(false)
  })
  it('discounts the cart total and can make shipping free', () => {
    const cheap = products.find((p) => !p.freeShipping && p.price < 30000)!
    const items = [{ productId: cheap.id, quantity: 1 }]
    const plain = cartSummary(items, lookup)
    expect(plain.shipping).toBeGreaterThan(0)
    const free = cartSummary(items, lookup, coupons.find((c) => c.code === 'ENVIOGRATIS'))
    expect(free.shipping).toBe(0)
    const off = cartSummary(items, lookup, coupons.find((c) => c.code === 'MERCADITO10'))
    expect(off.discount).toBe(Math.round(cheap.price * 0.1))
    expect(off.grandTotal).toBe(cheap.price + off.shipping - off.discount)
  })
})

describe('cart variants', () => {
  it('keeps the same product with different variants as separate lines', () => {
    let cart = cartReducer([], { type: 'add', productId: 'A', variant: 'Negro', quantity: 1, stock: 5 })
    cart = cartReducer(cart, { type: 'add', productId: 'A', variant: 'Azul', quantity: 1, stock: 5 })
    cart = cartReducer(cart, { type: 'add', productId: 'A', variant: 'Negro', quantity: 1, stock: 5 })
    expect(cart).toEqual([
      { productId: 'A', variant: 'Negro', quantity: 2 },
      { productId: 'A', variant: 'Azul', quantity: 1 },
    ])
    expect(cartReducer(cart, { type: 'remove', productId: 'A', variant: 'Azul' })).toHaveLength(1)
  })
  it('reports how much is missing for free shipping', () => {
    const cheap = products.find((p) => !p.freeShipping && p.price < 30000)!
    const s = cartSummary([{ productId: cheap.id, quantity: 1 }], lookup)
    expect(s.missingForFreeShipping).toBe(30000 - cheap.price)
  })
})

describe('shipping', () => {
  it('maps postal codes to regions', () => {
    expect(regionForZip('1425')).toBe('amba')
    expect(regionForZip('C1425ABC')).toBe('amba')
    expect(regionForZip('5000')).toBe('centro')
    expect(regionForZip('9410')).toBe('lejos')
    expect(regionForZip('abc')).toBeNull()
  })
  it('offers express only near the warehouse and zeroes free shipping', () => {
    expect(quoteShipping('1425', false)!.map((q) => q.method)).toEqual(['standard', 'express', 'pickup'])
    expect(quoteShipping('9410', false)!.map((q) => q.method)).toEqual(['standard', 'pickup'])
    expect(quoteShipping('1425', true)![0].cost).toBe(0)
  })
  it('labels arrival dates', () => {
    expect(arrivalLabel([0, 1])).toBe('Llega hoy')
    expect(arrivalLabel([1, 1])).toBe('Llega mañana')
    expect(arrivalLabel([2, 4], new Date(2026, 10, 3))).toMatch(/^Llega antes del sábado,? 7 de noviembre/)
  })
})

describe('search extras', () => {
  it('computes edit distance', () => {
    expect(editDistance('samsung', 'samsnug')).toBe(2)
    expect(editDistance('', 'abc')).toBe(3)
  })
  it('suggests corrections for typos', () => {
    expect(didYouMean('samsnug', products)).toBe('samsung')
    expect(didYouMean('notebok lenovo', products)).toBe('notebook lenovo')
    expect(didYouMean('samsung', products)).toBeUndefined()
  })
  it('autocompletes brands and titles', () => {
    expect(suggest('sam', products)[0]).toBe('samsung')
    expect(suggest('a', products)).toEqual([])
  })
  it('filters by brand, rating and FULL, and sorts by discount', () => {
    const r = searchProducts(products, { brand: 'JBL', minRating: 4, full: false })
    expect(r.every((p) => p.brand === 'JBL' && p.rating >= 4)).toBe(true)
    const byDiscount = searchProducts(products, { sort: 'discount' })
    const pct = (p: (typeof products)[0]) => (p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0)
    expect(pct(byDiscount[0])).toBeGreaterThanOrEqual(pct(byDiscount[1]))
  })
})

describe('orders', () => {
  it('advances status with time', () => {
    const order = buildOrder([], {
      subtotal: 0, shipping: 0, discount: 0, total: 0, delivery: 'standard', payment: 'cash', installments: 1,
      address: { name: '', street: '', city: '', zip: '', phone: '' },
    }, new Date(2026, 0, 1, 12, 0))
    const at = (min: number) => new Date(2026, 0, 1, 12, min)
    expect([at(1), at(3), at(7), at(30)].map((d) => orderStage(order, d))).toEqual([0, 1, 2, 3])
  })
})

describe('catalog', () => {
  it('has unique ids and a price history ending at the current price', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
    for (const p of products.slice(0, 5)) expect(priceHistory(p).at(-1)!.price).toBe(p.price)
  })
  it('creates and validates user listings', () => {
    expect(Object.keys(validateDraft(emptyDraft)).sort()).toEqual(['brand', 'description', 'price', 'title'])
    const p = createListing({ title: 'Bici playera', category: 'deportes', brand: 'Olmo', price: 150000, condition: 'usado', stock: 1, description: 'x' }, 'Ada')
    expect(p).toMatchObject({ userListing: true, seller: 'ADA', condition: 'usado', freeShipping: true, sold: 0 })
  })
})
