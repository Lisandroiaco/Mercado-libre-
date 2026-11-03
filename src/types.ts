export type CategoryId =
  | 'celulares'
  | 'computacion'
  | 'electronica'
  | 'hogar'
  | 'deportes'
  | 'moda'
  | 'juguetes'
  | 'herramientas'

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
}

export interface CartItem {
  productId: string
  quantity: number
}
