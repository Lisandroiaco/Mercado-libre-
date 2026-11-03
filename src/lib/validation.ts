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
