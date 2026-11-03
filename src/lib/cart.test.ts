import { productById } from '../data/products'
import { cartReducer, cartSummary } from './cart'

describe('cartReducer', () => {
  it('adds, merges and caps quantity at stock', () => {
    let cart = cartReducer([], { type: 'add', productId: 'A', quantity: 2, stock: 5 })
    cart = cartReducer(cart, { type: 'add', productId: 'A', quantity: 10, stock: 5 })
    expect(cart).toEqual([{ productId: 'A', quantity: 5 }])
  })

  it('updates with a minimum of 1 and removes items', () => {
    let cart = cartReducer([{ productId: 'A', quantity: 3 }], { type: 'update', productId: 'A', quantity: 0, stock: 5 })
    expect(cart[0].quantity).toBe(1)
    cart = cartReducer(cart, { type: 'remove', productId: 'A' })
    expect(cart).toEqual([])
  })
})

describe('cartSummary', () => {
  it('totals lines and skips unknown products', () => {
    const s = cartSummary(
      [
        { productId: 'MLA-2005', quantity: 2 },
        { productId: 'nope', quantity: 1 },
      ],
      productById,
    )
    const price = productById.get('MLA-2005')!.price
    expect(s.lines).toHaveLength(1)
    expect(s.count).toBe(2)
    expect(s.total).toBe(price * 2)
    expect(s.grandTotal).toBe(s.total + s.shipping)
  })

  it('charges shipping on small orders without free-shipping items', () => {
    const cheap = [...productById.values()].find((p) => !p.freeShipping && p.price < 30000)!
    const s = cartSummary([{ productId: cheap.id, quantity: 1 }], productById)
    expect(s.shipping).toBeGreaterThan(0)
  })
})
