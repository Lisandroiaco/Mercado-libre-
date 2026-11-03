import { ChevronDown, LogOut, MapPin, Menu, Monitor, Moon, Package, ShoppingCart, Store, Sun, User as UserIcon, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore, type Theme } from '../context/store'
import { categories } from '../data/categories'
import { categoryIcons } from './categoryIcons'
import { SearchBox } from './SearchBox'

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5 text-ink" aria-label="Mercadito, ir al inicio">
      <span className="grid size-10 place-items-center rounded-full border-2 border-ink bg-surface">
        <Store size={20} strokeWidth={2.25} />
      </span>
      <span className="hidden flex-col leading-none lg:flex">
        <span className="text-lg font-extrabold tracking-tight">mercadito</span>
        <span className="text-[10px] font-semibold">comprá fácil</span>
      </span>
    </Link>
  )
}

const themeOrder: Theme[] = ['light', 'dark', 'system']
const themeMeta = {
  light: { icon: Sun, label: 'Tema claro' },
  dark: { icon: Moon, label: 'Tema oscuro' },
  system: { icon: Monitor, label: 'Tema del sistema' },
}

function ThemeToggle() {
  const { theme, setTheme } = useStore()
  const { icon: Icon, label } = themeMeta[theme]
  const next = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`${label}. Cambiar a ${themeMeta[next].label.toLowerCase()}`}
      aria-label={`${label}. Cambiar a ${themeMeta[next].label.toLowerCase()}`}
      className="grid size-8 place-items-center rounded-full text-neutral-700 hover:bg-black/5"
    >
      <Icon size={18} />
    </button>
  )
}

function UserMenu() {
  const { user, logout, orders } = useStore()
  const [open, setOpen] = useState(false)
  if (!user) {
    return (
      <span className="flex items-center gap-4">
        <Link to="/ingresar?modo=registro" className="hover:text-neutral-900">Creá tu cuenta</Link>
        <Link to="/ingresar" className="hover:text-neutral-900">Ingresá</Link>
      </span>
    )
  }
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((o) => !o)} onMouseEnter={() => setOpen(true)} aria-expanded={open} className="flex items-center gap-1.5 hover:text-neutral-900">
        <span className="grid size-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-brand">{user.name[0]?.toUpperCase()}</span>
        {user.name.split(' ')[0]} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 w-56 rounded-md bg-surface py-2 text-sm shadow-xl ring-1 ring-neutral-200">
          <p className="border-b border-neutral-100 px-4 pb-2 text-xs text-neutral-500">{user.email}</p>
          <Link to="/mis-compras" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100">
            <Package size={16} /> Mis compras {orders.length > 0 && <span className="text-neutral-400">({orders.length})</span>}
          </Link>
          <Link to="/vender" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100">
            <Store size={16} /> Vender
          </Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-neutral-100">
            <LogOut size={16} /> Salir
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { summary, compare, user, setCartOpen } = useStore()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)

  // Close menus on every navigation. Adjusting state during render avoids an extra effect pass.
  const [lastKey, setLastKey] = useState(location.key)
  if (lastKey !== location.key) {
    setLastKey(location.key)
    setMenuOpen(false)
    setCatsOpen(false)
  }

  const navLink = ({ isActive }: { isActive: boolean }) => `hover:text-neutral-900 ${isActive ? 'font-medium text-neutral-900' : ''}`

  return (
    <header className="sticky top-0 z-40 bg-brand shadow-sm">
      <div className="mx-auto max-w-7xl px-4 pt-2.5 pb-2">
        <div className="flex items-center gap-3 sm:gap-6">
          <Logo />
          <SearchBox />
          <button type="button" className="shrink-0 md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menú" aria-expanded={menuOpen}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="hidden w-72 shrink-0 items-center gap-2 text-sm text-neutral-700 xl:flex">
            <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand">Nuevo</span>
            Cupón <b className="font-mono">MERCADITO10</b> 10% OFF
          </div>
        </div>

        <nav className="mt-2 hidden items-center gap-5 text-sm text-neutral-700 md:flex">
          <span className="flex w-36 items-center gap-1 text-xs leading-tight text-neutral-600">
            <MapPin size={20} />
            <span>
              Enviar a<br />
              <span className="text-sm text-neutral-800">{user ? user.name.split(' ')[0] : 'Capital Federal'}</span>
            </span>
          </span>
          <div className="relative" onMouseLeave={() => setCatsOpen(false)}>
            <button type="button" className="flex items-center gap-0.5 hover:text-neutral-900" onMouseEnter={() => setCatsOpen(true)} onClick={() => setCatsOpen((o) => !o)} aria-expanded={catsOpen}>
              Categorías <ChevronDown size={14} />
            </button>
            {catsOpen && (
              <ul className="absolute left-0 top-full z-50 w-72 rounded-b bg-ink py-2 text-white shadow-xl dark:text-neutral-900">
                {categories.map((c) => {
                  const Icon = categoryIcons[c.id]
                  return (
                    <li key={c.id}>
                      <Link to={`/buscar?category=${c.id}`} className="flex items-center gap-3 px-5 py-2 hover:bg-primary hover:text-white">
                        <Icon size={16} /> {c.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <NavLink to="/ofertas" className={navLink}>Ofertas</NavLink>
          <NavLink to="/historial" className={navLink}>Historial</NavLink>
          <NavLink to="/vender" className={navLink}>Vender</NavLink>
          <NavLink to="/ayuda" className={navLink}>Ayuda</NavLink>
          <span className="ml-auto flex items-center gap-5">
            {compare.length > 0 && (
              <NavLink to="/comparar" className={navLink}>Comparar ({compare.length})</NavLink>
            )}
            <UserMenu />
            <NavLink to="/mis-compras" className={navLink}>Mis compras</NavLink>
            <NavLink to="/favoritos" className={navLink}>Favoritos</NavLink>
            <ThemeToggle />
            <button type="button" onClick={() => setCartOpen(true)} className="relative text-neutral-800" aria-label={`Abrir carrito, ${summary.count} productos`}>
              <ShoppingCart size={22} />
              {summary.count > 0 && <CartBadge count={summary.count} />}
            </button>
          </span>
        </nav>
      </div>

      {menuOpen && (
        <nav className="max-h-[70vh] overflow-y-auto border-t border-black/10 bg-surface px-4 py-3 text-sm md:hidden">
          <div className="mb-3 flex items-center justify-between rounded-md bg-neutral-100 p-3">
            {user ? (
              <span className="flex items-center gap-2">
                <UserIcon size={18} /> Hola, {user.name.split(' ')[0]}
              </span>
            ) : (
              <Link to="/ingresar" className="font-semibold text-primary">Ingresá a tu cuenta</Link>
            )}
            <ThemeToggle />
          </div>
          <ul className="space-y-1">
            {[
              ['/ofertas', 'Ofertas'],
              ['/historial', 'Historial'],
              ['/comparar', `Comparar (${compare.length})`],
              ['/vender', 'Vender'],
              ['/ayuda', 'Ayuda'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="block py-2">{label}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Categorías</p>
          <ul className="grid grid-cols-2 gap-x-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/buscar?category=${c.id}`} className="block py-1.5 text-neutral-700">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

function CartBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
