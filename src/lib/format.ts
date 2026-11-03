const ars = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** Formats a price as "$ 1.234.567". */
export function formatPrice(value: number): string {
  return `$ ${ars.format(Math.round(value))}`
}

/** Percentage off, rounded down, or 0 if there is no discount. */
export function discountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.floor(((originalPrice - price) / originalPrice) * 100)
}

/** Value of each installment, rounded up so the total is always covered. */
export function installmentValue(price: number, installments: number): number {
  return Math.ceil(price / Math.max(1, installments))
}

export function formatSold(sold: number): string {
  if (sold >= 1000) return `+${Math.floor(sold / 1000)}mil vendidos`
  if (sold >= 100) return `+${Math.floor(sold / 100) * 100} vendidos`
  return `${sold} vendidos`
}

/** Milliseconds until the next midnight, when the "deals of the day" reset. */
export function msUntilMidnight(now = new Date()): number {
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  return end.getTime() - now.getTime()
}
