import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StoreProvider } from './context/StoreContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Collection from './pages/Collection'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProductDetail from './pages/ProductDetail'
import Search from './pages/Search'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="buscar" element={<Search />} />
        <Route path="ofertas" element={<Search dealsOnly />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="favoritos" element={<Collection kind="favorites" />} />
        <Route path="historial" element={<Collection kind="history" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <StoreProvider>
      {/* VITE_ROUTER=memory is used for the single-file demo build, which runs inside a sandboxed frame. */}
      {import.meta.env.VITE_ROUTER === 'memory' ? (
        <MemoryRouter>
          <AppRoutes />
        </MemoryRouter>
      ) : (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRoutes />
        </BrowserRouter>
      )}
    </StoreProvider>
  )
}
