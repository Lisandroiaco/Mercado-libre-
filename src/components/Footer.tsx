import { CreditCard, ShieldCheck, Truck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/store'
import { categories } from '../data/categories'

const perks = [
  { icon: CreditCard, title: 'Pagá con tarjeta o en efectivo', text: 'Con Mercadito tenés cuotas sin interés en productos seleccionados.' },
  { icon: Truck, title: 'Envío gratis desde $ 30.000', text: 'Solo por estar registrado tenés envíos gratis en miles de productos.' },
  { icon: ShieldCheck, title: 'Seguridad, de principio a fin', text: '¿No te gusta? ¡Devolvelo! No hay nada que no puedas hacer.' },
]

const YEAR = new Date().getFullYear()

function Newsletter() {
  const { notify } = useStore()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Ingresá un e-mail válido.')
    setError('')
    setEmail('')
    notify('¡Listo! Te vas a enterar de las mejores ofertas.')
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <label htmlFor="newsletter" className="font-semibold text-neutral-800">Recibí ofertas exclusivas</label>
      <div className="flex gap-2">
        <input
          id="newsletter"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          aria-invalid={!!error}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Suscribirme</button>
      </div>
      {error && <p id="newsletter-error" className="text-xs text-red-500">{error}</p>}
    </form>
  )
}

export function Footer() {
  return (
    <footer className="mt-16">
      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-center md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon size={44} strokeWidth={1.25} className="text-primary" />
              <h3 className="text-lg text-neutral-700">{title}</h3>
              <p className="max-w-xs text-sm text-neutral-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border-t border-neutral-200 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="font-semibold text-neutral-800">Categorías</p>
            <ul className="grid grid-cols-2 gap-1 text-neutral-500 sm:grid-cols-1">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}><Link to={`/buscar?category=${c.id}`} className="hover:text-primary">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-neutral-800">Tu cuenta</p>
            <ul className="space-y-1 text-neutral-500">
              <li><Link to="/mis-compras" className="hover:text-primary">Mis compras</Link></li>
              <li><Link to="/favoritos" className="hover:text-primary">Favoritos</Link></li>
              <li><Link to="/historial" className="hover:text-primary">Historial</Link></li>
              <li><Link to="/vender" className="hover:text-primary">Vender</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-neutral-800">Ayuda</p>
            <ul className="space-y-1 text-neutral-500">
              <li><Link to="/ayuda" className="hover:text-primary">Preguntas frecuentes</Link></li>
              <li><Link to="/ayuda#cupones" className="hover:text-primary">Cupones</Link></li>
              <li><Link to="/comparar" className="hover:text-primary">Comparar productos</Link></li>
            </ul>
          </div>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-neutral-200 bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <p>Proyecto de portfolio hecho con React, TypeScript y Tailwind CSS. No es un sitio comercial real.</p>
          <p>© {YEAR} Mercadito · Inspirado en los grandes marketplaces de Latinoamérica.</p>
        </div>
      </div>
    </footer>
  )
}
