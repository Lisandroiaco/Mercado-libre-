import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StoreProvider } from './context/StoreContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Collection from './pages/Collection'
import Compare from './pages/Compare'
import Help from './pages/Help'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { OrderDetail, OrderList } from './pages/Orders'
import ProductDetail from './pages/ProductDetail'
import Search from './pages/Search'
import Sell from './pages/Sell'
import Seller from './pages/Seller'

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
        <Route path="comparar" element={<Compare />} />
        <Route path="mis-compras" element={<OrderList />} />
        <Route path="mis-compras/:id" element={<OrderDetail />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="vender" element={<Sell />} />
        <Route path="vendedor/:name" element={<Seller />} />
        <Route path="ayuda" element={<Help />} />
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
