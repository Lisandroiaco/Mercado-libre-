import type { CategoryId, Product } from '../types'

export interface Address {
  name: string
  street: string
  city: string
  zip: string
  phone: string
}

export const emptyAddress: Address = { name: '', street: '', city: '', zip: '', phone: '' }

export function validateAddress(a: Address): Partial<Record<keyof Address, string>> {
  const errors: Partial<Record<keyof Address, string>> = {}
  if (a.name.trim().length < 3) errors.name = 'Ingresá tu nombre y apellido.'
  if (a.street.trim().length < 5) errors.street = 'Ingresá calle y número.'
  if (!a.city.trim()) errors.city = 'Ingresá la localidad.'
  if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(a.zip.trim())) errors.zip = 'Código postal inválido (ej: 1425).'
  if (!/^\+?[\d\s-]{8,}$/.test(a.phone.trim())) errors.phone = 'Ingresá un teléfono válido.'
  return errors
}

export interface Draft {
  title: string
  category: CategoryId
  brand: string
  price: string
  stock: string
  condition: Product['condition']
  description: string
}

export const emptyDraft: Draft = { title: '', category: 'celulares', brand: '', price: '', stock: '1', condition: 'nuevo', description: '' }

export function validateDraft(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {}
  if (d.title.trim().length < 10) errors.title = 'El título debe tener al menos 10 caracteres.'
  if (!d.brand.trim()) errors.brand = 'Indicá la marca.'
  const price = Number(d.price)
  if (!Number.isFinite(price) || price < 100) errors.price = 'Ingresá un precio de al menos $ 100.'
  const stock = Number(d.stock)
  if (!Number.isInteger(stock) || stock < 1 || stock > 999) errors.stock = 'El stock debe ser entre 1 y 999.'
  if (d.description.trim().length < 20) errors.description = 'Describí el producto (mínimo 20 caracteres).'
  return errors
}
