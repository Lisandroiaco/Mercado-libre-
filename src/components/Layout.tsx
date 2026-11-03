import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BackToTop } from './BackToTop'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { MobileTabBar } from './MobileTabBar'
import { Toaster } from './Toaster'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <a href="#contenido" className="sr-only z-50 bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <BackToTop />
      <CartDrawer />
      <Toaster />
    </div>
  )
}
