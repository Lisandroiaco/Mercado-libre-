import { createContext, useContext } from 'react'
import type { CartAction, CartSummary } from '../lib/cart'
import type { CartItem, Order, Product, Review, User } from '../types'

export type Theme = 'light' | 'dark' | 'system'

export interface Toast {
  id: number
  message: string
  action?: { label: string; to: string }
}

export interface StoreValue {
  /** Base catalog plus products the user published. */
  catalog: Product[]
  lookup: Map<string, Product>

  cart: CartItem[]
  summary: CartSummary
  dispatch: (action: CartAction) => void
  couponCode: string | null
  setCouponCode: (code: string | null) => void
  saved: CartItem[]
  saveForLater: (item: CartItem) => void
  moveToCart: (item: CartItem) => void
  removeSaved: (item: CartItem) => void

  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  history: string[]
  addToHistory: (id: string) => void
  clearHistory: () => void

  compare: string[]
  toggleCompare: (id: string) => void

  recentSearches: string[]
  addSearch: (q: string) => void
  clearSearches: () => void

  orders: Order[]
  placeOrder: (order: Order) => void

  user: User | null
  login: (user: User) => void
  logout: () => void

  myReviews: Record<string, Review[]>
  addReview: (productId: string, review: Review) => void

  publishProduct: (product: Product) => void
  removeListing: (id: string) => void
  myListings: Product[]

  theme: Theme
  setTheme: (t: Theme) => void

  cartOpen: boolean
  setCartOpen: (open: boolean) => void

  toasts: Toast[]
  notify: (message: string, action?: Toast['action']) => void
  dismissToast: (id: number) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export const MAX_COMPARE = 3
