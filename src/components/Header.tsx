import { ChevronDown, MapPin, Menu, Search, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/store'
import { categories } from '../data/categories'

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-1.5 text-ink" aria-label="Mercadito, ir al inicio">
      <span className="grid size-10 place-items-center rounded-full border-2 border-ink bg-white">
        <ShoppingBag size={22} strokeWidth={2.25} />
      </span>
      <span className="hidden flex-col leading-none lg:flex">
        <span className="text-lg font-extrabold tracking-tight">mercadito</span>
        <span className="text-[10px] font-semibold">comprá fácil</span>
      </span>
    </Link>
  )
}

export function Header() {
  const { summary } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)

  // On every navigation (including the back button) sync the input and close menus.
  // Adjusting state during render avoids an extra effect pass.
  const [lastKey, setLastKey] = useState(location.key)
  if (lastKey !== location.key) {
    setLastKey(location.key)
    setQuery(params.get('q') ?? '')
    setMenuOpen(false)
    setCatsOpen(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar')
  }

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `hover:text-black ${isActive ? 'text-black font-medium' : ''}`

  return (
    <header className="sticky top-0 z-40 bg-brand shadow-sm">
      <div className="mx-auto max-w-7xl px-4 pt-2.5 pb-2">
        <div className="flex items-center gap-3 sm:gap-6">
          <Logo />
          <form onSubmit={submit} role="search" className="flex h-10 min-w-0 flex-1 items-center rounded bg-white shadow">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, marcas y más…"
              aria-label="Buscar"
              className="h-full min-w-0 flex-1 rounded-l bg-transparent px-4 text-sm outline-none placeholder:text-neutral-400"
            />
            <button type="submit" aria-label="Buscar" className="grid h-full w-12 place-items-center border-l border-neutral-200 text-neutral-500 hover:text-neutral-800">
              <Search size={18} />
            </button>
          </form>
          <Link to="/carrito" className="relative shrink-0 text-neutral-800 md:hidden" aria-label={`Carrito, ${summary.count} productos`}>
            <ShoppingCart size={24} />
            {summary.count > 0 && <CartBadge count={summary.count} />}
          </Link>
          <button type="button" className="shrink-0 md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menú" aria-expanded={menuOpen}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="hidden w-72 shrink-0 text-sm text-neutral-700 xl:block">
            Comprá en hasta <b>12 cuotas sin interés</b> 💳
          </div>
        </div>

        <nav className="mt-2 hidden items-center gap-6 text-sm text-neutral-700 md:flex">
          <span className="flex w-40 items-center gap-1 text-xs leading-tight text-neutral-600">
            <MapPin size={20} />
            <span>
              Enviar a<br />
              <span className="text-sm text-neutral-800">Capital Federal</span>
            </span>
          </span>
          <div className="relative" onMouseLeave={() => setCatsOpen(false)}>
            <button
              type="button"
              className="flex items-center gap-0.5 hover:text-black"
              onMouseEnter={() => setCatsOpen(true)}
              onClick={() => setCatsOpen((o) => !o)}
              aria-expanded={catsOpen}
            >
              Categorías <ChevronDown size={14} />
            </button>
            {catsOpen && (
              <ul className="absolute left-0 top-full z-50 w-64 rounded-b bg-neutral-900 py-2 text-white shadow-xl">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link to={`/buscar?category=${c.id}`} className="block px-5 py-2 hover:bg-primary">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NavLink to="/ofertas" className={navLink}>Ofertas</NavLink>
          <NavLink to="/historial" className={navLink}>Historial</NavLink>
          <NavLink to="/favoritos" className={navLink}>Favoritos</NavLink>
          <a href="https://github.com/lisandroiaco/mercado-libre-" target="_blank" rel="noreferrer" className="hover:text-black">
            Código fuente
          </a>
          <Link to="/carrito" className="relative ml-auto text-neutral-800" aria-label={`Carrito, ${summary.count} productos`}>
            <ShoppingCart size={22} />
            {summary.count > 0 && <CartBadge count={summary.count} />}
          </Link>
        </nav>
      </div>

      {menuOpen && (
        <nav className="border-t border-black/10 bg-white px-4 py-3 text-sm md:hidden">
          <ul className="space-y-1">
            {[
              ['/ofertas', 'Ofertas'],
              ['/historial', 'Historial'],
              ['/favoritos', 'Favoritos'],
              ['/carrito', 'Carrito'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="block py-2">{label}</Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-1 text-xs font-semibold uppercase text-neutral-500">Categorías</p>
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
