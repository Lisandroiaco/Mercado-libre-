import { createContext, useContext } from 'react'
import type { CartAction, cartSummary } from '../lib/cart'
import type { CartItem } from '../types'

export interface StoreValue {
  cart: CartItem[]
  summary: ReturnType<typeof cartSummary>
  dispatch: (action: CartAction) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  history: string[]
  addToHistory: (id: string) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
