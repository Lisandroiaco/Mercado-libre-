import { Heart, Home, Package, Search, ShoppingCart } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../context/store'

const tabs = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/mis-compras', label: 'Compras', icon: Package },
  { to: '/carrito', label: 'Carrito', icon: ShoppingCart },
]

/** App-style bottom navigation, shown only on phones. */
export function MobileTabBar() {
  const { summary } = useStore()
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-primary' : 'text-neutral-500'}`}
            >
              <Icon size={20} />
              {label}
              {to === '/carrito' && summary.count > 0 && (
                <span className="absolute right-[calc(50%-18px)] top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {summary.count}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
