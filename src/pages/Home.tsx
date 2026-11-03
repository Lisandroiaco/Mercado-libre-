import { BadgeCheck, ChevronLeft, ChevronRight, CreditCard, Landmark, ShieldCheck, Tag, Truck, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Countdown } from '../components/Countdown'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { ProductRow } from '../components/ProductRow'
import { categoryIcons } from '../components/categoryIcons'
import { useStore } from '../context/store'
import { categories } from '../data/categories'
import { discountPercent } from '../lib/format'
import type { Product } from '../types'

const slides = [
  { title: 'Hasta 40% OFF en tecnología', subtitle: 'Celulares, notebooks y más con envío gratis', cta: 'Ver ofertas', to: '/ofertas', from: '#3483fa', to2: '#2d3277' },
  { title: 'Renová tu hogar', subtitle: 'Freidoras, cafeteras y robots aspiradores en 12 cuotas', cta: 'Ver hogar', to: '/buscar?category=hogar', from: '#ff7733', to2: '#c2410c' },
  { title: '10% OFF con MERCADITO10', subtitle: 'Aplicá el cupón en tu carrito. Válido en toda la tienda.', cta: 'Ver cupones', to: '/ayuda#cupones', from: '#7c3aed', to2: '#2d3277' },
  { title: 'Entrená donde quieras', subtitle: 'Bicicletas, mancuernas y zapatillas al mejor precio', cta: 'Ver deportes', to: '/buscar?category=deportes', from: '#00a650', to2: '#065f46' },
]

function Hero() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(id)
  }, [])
  const go = (dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length)

  return (
    <section aria-roledescription="carrusel" className="group relative h-56 overflow-hidden bg-gradient-to-b from-brand to-page sm:h-80">
      {slides.map((s, i) => (
        <div
          key={s.title}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-start px-4 pt-4">
            <div
              className="flex h-[85%] w-full flex-col justify-center gap-3 rounded-lg px-8 text-white shadow-lg sm:px-16"
              style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to2})` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Solo por esta semana</p>
              <h1 className="max-w-lg text-2xl font-bold sm:text-5xl">{s.title}</h1>
              <p className="max-w-md text-sm opacity-90 sm:text-lg">{s.subtitle}</p>
              <Link to={s.to} tabIndex={i === index ? 0 : -1} className="w-fit rounded bg-surface px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100">
                {s.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          type="button"
          onClick={() => go(dir)}
          aria-label={dir < 0 ? 'Banner anterior' : 'Banner siguiente'}
          className={`absolute top-1/3 hidden h-24 w-12 place-items-center bg-surface/80 text-primary opacity-0 shadow transition group-hover:opacity-100 sm:grid ${
            dir < 0 ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'
          }`}
        >
          {dir < 0 ? <ChevronLeft /> : <ChevronRight />}
        </button>
      ))}
      <div className="absolute bottom-6 right-8 flex gap-2 sm:bottom-10 sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Ir al banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`size-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  )
}

const payments = [
  { icon: CreditCard, title: 'Tarjeta de crédito', text: 'Hasta 12 cuotas sin interés' },
  { icon: Landmark, title: 'Transferencia', text: 'Acreditación instantánea' },
  { icon: Truck, title: 'Envío gratis', text: 'En compras desde $ 30.000' },
  { icon: ShieldCheck, title: 'Compra protegida', text: 'Te devolvemos tu dinero' },
]

export default function Home() {
  const { history, catalog, lookup, user, myListings } = useStore()
  const deals = useMemo(
    () => catalog.filter((p) => p.originalPrice).sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice)),
    [catalog],
  )
  const bestSellers = useMemo(() => [...catalog].sort((a, b) => b.sold - a.sold).slice(0, 12), [catalog])
  const topRated = useMemo(() => [...catalog].filter((p) => p.reviewsCount > 50).sort((a, b) => b.rating - a.rating).slice(0, 12), [catalog])
  const viewed = history.map((id) => lookup.get(id)).filter((p): p is Product => !!p)
  const stores = useMemo(() => {
    const bySeller = new Map<string, Product[]>()
    for (const p of catalog) if (p.seller.includes('TIENDA OFICIAL')) bySeller.set(p.seller, [...(bySeller.get(p.seller) ?? []), p])
    return [...bySeller.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6)
  }, [catalog])
  // "Deals of the day": the three biggest discounts.
  const flash = deals.slice(0, 3)
  const under30 = useMemo(() => catalog.filter((p) => p.price <= 30000).sort((a, b) => b.sold - a.sold), [catalog])

  return (
    <>
      <Hero />
      <div className="mx-auto -mt-6 max-w-7xl space-y-12 px-4">
        <section className="relative grid grid-cols-2 divide-neutral-200 rounded-md bg-surface shadow-sm md:grid-cols-4 md:divide-x">
          {payments.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 p-4">
              <Icon className="shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-neutral-800">{title}</p>
                <p className="text-xs text-primary">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {user && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface p-5 shadow-sm">
            <p className="text-lg">
              ¡Hola, <b>{user.name.split(' ')[0]}</b>! Tenés <span className="font-semibold text-success">10% OFF</span> con el cupón{' '}
              <span className="rounded bg-neutral-100 px-1.5 font-mono text-sm">MERCADITO10</span>
            </p>
            <Link to="/mis-compras" className="text-sm text-primary hover:underline">Ver mis compras</Link>
          </section>
        )}

        {viewed.length > 0 && (
          <ProductRow title="Basado en tu última visita" action={<Link to="/historial" className="text-sm text-primary hover:underline">Ver historial</Link>} products={viewed} />
        )}

        <section className="overflow-hidden rounded-md bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-warning to-red-500 px-5 py-3 text-white">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Zap size={20} className="fill-brand text-brand" /> Ofertas relámpago
            </h2>
            <p className="flex items-center gap-2 text-sm">Terminan en <Countdown /></p>
          </div>
          <div className="grid gap-px bg-neutral-100 sm:grid-cols-3">
            {flash.map((p) => {
              const claimed = 40 + ((p.sold * 7) % 55)
              return (
                <Link key={p.id} to={`/producto/${p.id}`} className="group flex gap-4 bg-surface p-4 transition hover:bg-neutral-50">
                  <ProductImage product={p} className="size-28 shrink-0 rounded transition group-hover:brightness-105" showBrand={false} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="line-clamp-2 text-sm text-neutral-700">{p.title}</p>
                    <Price product={p} />
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full bg-warning" style={{ width: `${claimed}%` }} />
                    </div>
                    <p className="text-xs text-neutral-500">{claimed}% vendido</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {myListings.length > 0 && <ProductRow title="Tus publicaciones" action={<Link to="/vender" className="text-sm text-primary hover:underline">Administrar</Link>} products={myListings} />}

        <ProductRow title="Ofertas" action={<Link to="/ofertas" className="text-sm text-primary hover:underline">Ver todas</Link>} products={deals} />

        <section>
          <h2 className="mb-3 text-xl font-semibold text-neutral-700 sm:text-2xl">Categorías populares</h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-neutral-200 shadow-sm sm:grid-cols-5">
            {categories.map((c) => {
              const Icon = categoryIcons[c.id]
              return (
                <Link
                  key={c.id}
                  to={`/buscar?category=${c.id}`}
                  className="group flex flex-col items-center gap-3 bg-surface p-6 text-center text-sm text-neutral-700 transition hover:bg-primary hover:text-white"
                >
                  <span className="grid size-16 place-items-center rounded-full transition group-hover:bg-white/20" style={{ background: `hsl(${c.hue} 80% 95%)`, color: `hsl(${c.hue} 55% 40%)` }}>
                    <Icon size={30} strokeWidth={1.5} className="group-hover:text-white" />
                  </span>
                  {c.name}
                </Link>
              )
            })}
          </div>
        </section>

        <ProductRow title="Lo más vendido" products={bestSellers} />

        <section>
          <h2 className="mb-3 text-xl font-semibold text-neutral-700 sm:text-2xl">Tiendas oficiales</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stores.map(([seller, items]) => (
              <Link key={seller} to={`/vendedor/${encodeURIComponent(seller)}`} className="flex flex-col items-center gap-2 rounded-md bg-surface p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid size-14 place-items-center rounded-full bg-brand text-xl font-extrabold text-ink">{seller[0]}</span>
                <span className="flex items-center gap-1 text-sm font-semibold">
                  {seller.replace(' TIENDA OFICIAL', '')} <BadgeCheck size={14} className="text-primary" />
                </span>
                <span className="text-xs text-neutral-500">{items.length} productos</span>
              </Link>
            ))}
          </div>
        </section>

        <ProductRow title="Mejor calificados" products={topRated} />

        <Link to="/buscar?max=30000" className="flex items-center justify-between gap-4 rounded-md bg-gradient-to-r from-success to-emerald-700 p-6 text-white shadow-sm transition hover:brightness-105">
          <span className="flex items-center gap-3">
            <Tag size={32} />
            <span>
              <span className="block text-xl font-bold">Todo por menos de $ 30.000</span>
              <span className="text-sm opacity-90">{under30.length} productos para regalar o darte un gusto</span>
            </span>
          </span>
          <ChevronRight />
        </Link>
      </div>
    </>
  )
}
