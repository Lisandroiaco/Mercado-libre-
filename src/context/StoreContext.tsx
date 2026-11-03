import { useCallback, useMemo, type ReactNode } from 'react'
import { productById } from '../data/products'
import { cartReducer, cartSummary, type CartAction } from '../lib/cart'
import { useLocalStorage } from '../lib/useLocalStorage'
import type { CartItem } from '../types'
import { StoreContext, type StoreValue } from './store'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useLocalStorage<CartItem[]>('mercadito:cart', [])
  const [favorites, setFavorites] = useLocalStorage<string[]>('mercadito:favorites', [])
  const [history, setHistory] = useLocalStorage<string[]>('mercadito:history', [])

  const dispatch = useCallback((action: CartAction) => setCart((c) => cartReducer(c, action)), [setCart])
  const toggleFavorite = useCallback(
    (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
    [setFavorites],
  )
  const addToHistory = useCallback(
    (id: string) => setHistory((h) => [id, ...h.filter((x) => x !== id)].slice(0, 12)),
    [setHistory],
  )

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      summary: cartSummary(cart, productById),
      dispatch,
      favorites,
      toggleFavorite,
      isFavorite: (id) => favorites.includes(id),
      history,
      addToHistory,
    }),
    [cart, dispatch, favorites, toggleFavorite, history, addToHistory],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
