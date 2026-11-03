import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { products as baseProducts } from '../data/products'
import { cartReducer, cartSummary, type CartAction } from '../lib/cart'
import { coupons } from '../lib/coupons'
import { useLocalStorage } from '../lib/useLocalStorage'
import type { CartItem, Order, Product, Review, User } from '../types'
import { MAX_COMPARE, StoreContext, type StoreValue, type Theme, type Toast } from './store'

const sameItem = (a: CartItem, b: CartItem) => a.productId === b.productId && a.variant === b.variant

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useLocalStorage<CartItem[]>('mercadito:cart', [])
  const [saved, setSaved] = useLocalStorage<CartItem[]>('mercadito:saved', [])
  const [couponCode, setCouponCode] = useLocalStorage<string | null>('mercadito:coupon', null)
  const [favorites, setFavorites] = useLocalStorage<string[]>('mercadito:favorites', [])
  const [history, setHistory] = useLocalStorage<string[]>('mercadito:history', [])
  const [compare, setCompare] = useLocalStorage<string[]>('mercadito:compare', [])
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('mercadito:searches', [])
  const [orders, setOrders] = useLocalStorage<Order[]>('mercadito:orders', [])
  const [user, setUser] = useLocalStorage<User | null>('mercadito:user', null)
  const [myReviews, setMyReviews] = useLocalStorage<Record<string, Review[]>>('mercadito:reviews', {})
  const [myListings, setMyListings] = useLocalStorage<Product[]>('mercadito:listings', [])
  const [theme, setTheme] = useLocalStorage<Theme>('mercadito:theme', 'system')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const toastId = useRef(0)

  // Apply the theme to <html> and follow the OS setting when on "system".
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && !!media?.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    media?.addEventListener?.('change', apply)
    return () => media?.removeEventListener?.('change', apply)
  }, [theme])

  const catalog = useMemo(() => [...myListings, ...baseProducts], [myListings])
  const lookup = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog])
  const coupon = coupons.find((c) => c.code === couponCode)

  const dispatch = useCallback((action: CartAction) => setCart((c) => cartReducer(c, action)), [setCart])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback(
    (message: string, action?: Toast['action']) => {
      const id = ++toastId.current
      setToasts((t) => [...t.slice(-2), { id, message, action }])
      setTimeout(() => dismissToast(id), 3500)
    },
    [dismissToast],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const removing = favorites.includes(id)
      setFavorites(removing ? favorites.filter((x) => x !== id) : [id, ...favorites])
      notify(removing ? 'Lo quitaste de favoritos' : 'Agregado a favoritos', removing ? undefined : { label: 'Ver', to: '/favoritos' })
    },
    [favorites, setFavorites, notify],
  )

  const toggleCompare = useCallback(
    (id: string) => {
      if (compare.includes(id)) return setCompare(compare.filter((x) => x !== id))
      if (compare.length >= MAX_COMPARE) {
        return notify(`Podés comparar hasta ${MAX_COMPARE} productos`, { label: 'Comparar', to: '/comparar' })
      }
      setCompare([...compare, id])
      notify('Agregado al comparador', { label: 'Comparar', to: '/comparar' })
    },
    [compare, setCompare, notify],
  )

  const value = useMemo<StoreValue>(
    () => ({
      catalog,
      lookup,
      cart,
      summary: cartSummary(cart, lookup, coupon),
      dispatch,
      couponCode,
      setCouponCode,
      saved,
      saveForLater: (item) => {
        setCart((c) => c.filter((i) => !sameItem(i, item)))
        setSaved((s) => [item, ...s.filter((i) => !sameItem(i, item))])
      },
      moveToCart: (item) => {
        setSaved((s) => s.filter((i) => !sameItem(i, item)))
        setCart((c) => [...c.filter((i) => !sameItem(i, item)), item])
      },
      removeSaved: (item) => setSaved((s) => s.filter((i) => !sameItem(i, item))),
      favorites,
      toggleFavorite,
      isFavorite: (id) => favorites.includes(id),
      history,
      addToHistory: (id) => setHistory((h) => (h[0] === id ? h : [id, ...h.filter((x) => x !== id)].slice(0, 20))),
      clearHistory: () => setHistory([]),
      compare,
      toggleCompare,
      recentSearches,
      addSearch: (q) => {
        const term = q.trim().toLowerCase()
        if (term) setRecentSearches((s) => [term, ...s.filter((x) => x !== term)].slice(0, 6))
      },
      clearSearches: () => setRecentSearches([]),
      orders,
      placeOrder: (order) => setOrders((o) => [order, ...o]),
      user,
      login: (u) => setUser(u),
      logout: () => setUser(null),
      myReviews,
      addReview: (productId, review) => setMyReviews((r) => ({ ...r, [productId]: [review, ...(r[productId] ?? [])] })),
      myListings,
      publishProduct: (p) => setMyListings((l) => [p, ...l]),
      removeListing: (id) => setMyListings((l) => l.filter((p) => p.id !== id)),
      theme,
      setTheme,
      cartOpen,
      setCartOpen,
      toasts,
      notify,
      dismissToast,
    }),
    [catalog, lookup, cart, coupon, couponCode, saved, favorites, history, compare, recentSearches, orders, user, myReviews, myListings, theme, toasts, cartOpen, dispatch, toggleFavorite, toggleCompare, notify, dismissToast,
      setCart, setSaved, setCouponCode, setHistory, setRecentSearches, setOrders, setUser, setMyReviews, setMyListings, setTheme],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
