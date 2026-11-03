export interface Coupon {
  code: string
  description: string
  /** Minimum subtotal to apply the coupon. */
  minSubtotal: number
  /** Returns the discount in pesos for a given subtotal. */
  discount: (subtotal: number) => number
  freeShipping?: boolean
}

export const coupons: Coupon[] = [
  {
    code: 'MERCADITO10',
    description: '10% OFF hasta $ 50.000',
    minSubtotal: 0,
    discount: (subtotal) => Math.min(Math.round(subtotal * 0.1), 50000),
  },
  {
    code: 'BIENVENIDA',
    description: '$ 5.000 OFF en compras desde $ 30.000',
    minSubtotal: 30000,
    discount: () => 5000,
  },
  {
    code: 'ENVIOGRATIS',
    description: 'Envío gratis en tu compra',
    minSubtotal: 0,
    discount: () => 0,
    freeShipping: true,
  },
]

export type CouponResult = { ok: true; coupon: Coupon } | { ok: false; error: string }

export function validateCoupon(code: string, subtotal: number): CouponResult {
  const coupon = coupons.find((c) => c.code === code.trim().toUpperCase())
  if (!coupon) return { ok: false, error: 'El cupón no existe o venció.' }
  if (subtotal < coupon.minSubtotal)
    return { ok: false, error: `Este cupón requiere una compra mínima de $ ${coupon.minSubtotal.toLocaleString('es-AR')}.` }
  return { ok: true, coupon }
}
