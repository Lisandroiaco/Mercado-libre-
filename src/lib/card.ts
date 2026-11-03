export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'desconocida'

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Luhn checksum used by every major card network. */
export function luhnValid(number: string): boolean {
  const digits = digitsOnly(number)
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

export function detectBrand(number: string): CardBrand {
  const d = digitsOnly(number)
  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard'
  if (/^3[47]/.test(d)) return 'amex'
  return 'desconocida'
}

/** Groups digits in blocks of 4 (4-6-5 for Amex) as the user types. */
export function formatCardNumber(value: string): string {
  const d = digitsOnly(value).slice(0, 19)
  if (detectBrand(d) === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ')
  return d.replace(/(.{4})/g, '$1 ').trim()
}

/** Validates "MM/AA" and checks it is not in the past. */
export function expiryValid(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const lastDay = new Date(year, month, 0, 23, 59, 59)
  return lastDay >= now
}

export interface CardForm {
  number: string
  name: string
  expiry: string
  cvv: string
}

export function validateCard(card: CardForm, now = new Date()): Partial<Record<keyof CardForm, string>> {
  const errors: Partial<Record<keyof CardForm, string>> = {}
  if (!luhnValid(card.number)) errors.number = 'Revisá el número de tarjeta.'
  if (card.name.trim().length < 3) errors.name = 'Ingresá el nombre como figura en la tarjeta.'
  if (!expiryValid(card.expiry, now)) errors.expiry = 'Fecha inválida o vencida (MM/AA).'
  const cvvLength = detectBrand(card.number) === 'amex' ? 4 : 3
  if (digitsOnly(card.cvv).length !== cvvLength) errors.cvv = `Ingresá los ${cvvLength} dígitos del código.`
  return errors
}
