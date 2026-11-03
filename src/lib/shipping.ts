import type { DeliveryMethod } from '../types'

export interface ShippingQuote {
  method: DeliveryMethod
  label: string
  days: [number, number]
  cost: number
}

/** Region by the first digit of an Argentine postal code (CPA or legacy 4-digit). */
export function regionForZip(zip: string): 'amba' | 'centro' | 'lejos' | null {
  const digits = zip.trim().replace(/^[A-Za-z]/, '').slice(0, 4)
  if (!/^\d{4}$/.test(digits)) return null
  const n = Number(digits)
  if (n < 2000) return 'amba'
  if (n < 6000) return 'centro'
  return 'lejos'
}

/**
 * Delivery options for a postal code. `freeShipping` zeroes the standard cost;
 * express always has a surcharge and pickup is always free.
 */
export function quoteShipping(zip: string, freeShipping: boolean): ShippingQuote[] | null {
  const region = regionForZip(zip)
  if (!region) return null
  const base = { amba: 3999, centro: 5999, lejos: 8999 }[region]
  const days: Record<typeof region, [number, number]> = { amba: [1, 2], centro: [2, 4], lejos: [4, 7] }
  const quotes: ShippingQuote[] = [
    { method: 'standard', label: 'Envío a domicilio', days: days[region], cost: freeShipping ? 0 : base },
    { method: 'pickup', label: 'Retiro en punto de entrega', days: [days[region][0] + 1, days[region][1] + 1], cost: 0 },
  ]
  if (region !== 'lejos') quotes.splice(1, 0, { method: 'express', label: 'Envío express', days: [0, 1], cost: base + 2500 })
  return quotes
}

const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

/** "Llega el martes 5 de noviembre" style label for the earliest day of a range. */
export function arrivalLabel(days: [number, number], from = new Date()): string {
  if (days[0] === 0) return 'Llega hoy'
  if (days[0] === 1 && days[1] <= 1) return 'Llega mañana'
  const date = new Date(from)
  date.setDate(date.getDate() + days[1])
  return `Llega antes del ${weekday.format(date)}`
}
