import type { CartItem, Product } from '../types'

export type CartAction =
  | { type: 'add'; productId: string; quantity: number; stock: number }
  | { type: 'update'; productId: string; quantity: number; stock: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }

const clamp = (n: number, max: number) => Math.max(1, Math.min(n, max))

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = items.find((i) => i.productId === action.productId)
      if (existing) {
        return items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: clamp(i.quantity + action.quantity, action.stock) }
            : i,
        )
      }
      return [...items, { productId: action.productId, quantity: clamp(action.quantity, action.stock) }]
    }
    case 'update':
      return items.map((i) =>
        i.productId === action.productId ? { ...i, quantity: clamp(action.quantity, action.stock) } : i,
      )
    case 'remove':
      return items.filter((i) => i.productId !== action.productId)
    case 'clear':
      return []
  }
}

export interface CartLine {
  product: Product
  quantity: number
  subtotal: number
}

export function cartSummary(items: CartItem[], lookup: Map<string, Product>) {
  const lines: CartLine[] = items.flatMap((item) => {
    const product = lookup.get(item.productId)
    return product ? [{ product, quantity: item.quantity, subtotal: product.price * item.quantity }] : []
  })
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0)
  const count = lines.reduce((sum, l) => sum + l.quantity, 0)
  const freeShipping = lines.some((l) => l.product.freeShipping) || total >= 30000
  const shipping = lines.length === 0 || freeShipping ? 0 : 4999
  return { lines, count, total, shipping, grandTotal: total + shipping }
}
