import type { CartItem, Product } from '../types'
import type { Coupon } from './coupons'

type Key = { productId: string; variant?: string }

export type CartAction =
  | ({ type: 'add'; quantity: number; stock: number } & Key)
  | ({ type: 'update'; quantity: number; stock: number } & Key)
  | ({ type: 'remove' } & Key)
  | { type: 'clear' }
  | { type: 'set'; items: CartItem[] }

const clamp = (n: number, max: number) => Math.max(1, Math.min(n, max))
const same = (item: CartItem, key: Key) => item.productId === key.productId && item.variant === key.variant

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      if (items.some((i) => same(i, action))) {
        return items.map((i) => (same(i, action) ? { ...i, quantity: clamp(i.quantity + action.quantity, action.stock) } : i))
      }
      const item: CartItem = { productId: action.productId, quantity: clamp(action.quantity, action.stock) }
      if (action.variant) item.variant = action.variant
      return [...items, item]
    }
    case 'update':
      return items.map((i) => (same(i, action) ? { ...i, quantity: clamp(action.quantity, action.stock) } : i))
    case 'remove':
      return items.filter((i) => !same(i, action))
    case 'clear':
      return []
    case 'set':
      return action.items
  }
}

export interface CartLine {
  product: Product
  quantity: number
  variant?: string
  subtotal: number
}

/** Orders from this amount ship for free. */
export const FREE_SHIPPING_THRESHOLD = 30000
export const SHIPPING_COST = 4999

export function cartSummary(items: CartItem[], lookup: Map<string, Product>, coupon?: Coupon) {
  const lines: CartLine[] = items.flatMap((item) => {
    const product = lookup.get(item.productId)
    return product
      ? [{ product, quantity: item.quantity, variant: item.variant, subtotal: product.price * item.quantity }]
      : []
  })
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0)
  const count = lines.reduce((sum, l) => sum + l.quantity, 0)
  const couponApplies = !!coupon && total >= coupon.minSubtotal
  const freeShipping =
    lines.some((l) => l.product.freeShipping) || total >= FREE_SHIPPING_THRESHOLD || (couponApplies && !!coupon.freeShipping)
  const shipping = lines.length === 0 || freeShipping ? 0 : SHIPPING_COST
  const discount = couponApplies ? Math.min(coupon.discount(total), total) : 0
  return {
    lines,
    count,
    total,
    shipping,
    discount,
    coupon: couponApplies ? coupon : undefined,
    /** How much is missing to reach free shipping (0 if already free). */
    missingForFreeShipping: freeShipping ? 0 : FREE_SHIPPING_THRESHOLD - total,
    grandTotal: total + shipping - discount,
  }
}

export type CartSummary = ReturnType<typeof cartSummary>
