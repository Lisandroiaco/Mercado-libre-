export type CategoryId =
  | 'celulares'
  | 'computacion'
  | 'electronica'
  | 'hogar'
  | 'deportes'
  | 'moda'
  | 'juguetes'
  | 'herramientas'
  | 'belleza'
  | 'mascotas'

export interface Category {
  id: CategoryId
  name: string
  /** Hue (0-360) used to tint the generated product artwork. */
  hue: number
}

export interface Review {
  author: string
  rating: number
  title: string
  body: string
  date: string
}

export interface Question {
  question: string
  answer?: string
  date: string
}

export interface Product {
  id: string
  title: string
  category: CategoryId
  brand: string
  price: number
  /** Price before discount, if the product is on sale. */
  originalPrice?: number
  condition: 'nuevo' | 'usado'
  freeShipping: boolean
  fullShipping: boolean
  stock: number
  sold: number
  rating: number
  reviewsCount: number
  /** Number of interest-free installments offered. */
  installments: number
  seller: string
  location: string
  description: string
  attributes: Record<string, string>
  reviews: Review[]
  questions: Question[]
  /** Selectable options such as color or size. */
  variants?: { name: string; options: string[] }
  /** True for products the user published from the "Vender" page. */
  userListing?: boolean
}

export interface CartItem {
  productId: string
  quantity: number
  variant?: string
}

export type DeliveryMethod = 'standard' | 'express' | 'pickup'
export type PaymentMethod = 'card' | 'transfer' | 'cash'

export interface OrderLine {
  productId: string
  title: string
  price: number
  quantity: number
  variant?: string
}

export interface Order {
  id: string
  /** ISO timestamp. */
  date: string
  lines: OrderLine[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  coupon?: string
  delivery: DeliveryMethod
  payment: PaymentMethod
  installments: number
  address: { name: string; street: string; city: string; zip: string; phone: string }
}

export interface User {
  name: string
  email: string
}
