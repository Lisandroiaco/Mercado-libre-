import { Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { coupons } from '../lib/coupons'
import { normalize } from '../lib/search'

const faqs = [
  { q: '¿Cómo compro un producto?', a: 'Buscá lo que querés, elegí la cantidad y tocá "Comprar ahora". Completás la dirección, el medio de pago y confirmás.' },
  { q: '¿Cuánto cuesta el envío?', a: 'Es gratis en productos con la etiqueta "Envío gratis" y en compras desde $ 30.000. Si no, depende de tu código postal: calculalo en la página del producto.' },
  { q: '¿Qué es FULL?', a: 'Son productos que guardamos en nuestros depósitos, así llegan más rápido. Los encontrás con el filtro FULL en la búsqueda.' },
  { q: '¿Puedo pagar en cuotas?', a: 'Sí, con tarjeta de crédito tenés hasta 12 cuotas sin interés según el producto. El número de cuotas aparece debajo del precio.' },
  { q: '¿Cómo sigo mi compra?', a: 'En "Mis compras" ves el estado de cada pedido: confirmado, en preparación, en camino y entregado.' },
  { q: '¿Cómo publico un producto?', a: 'Entrá a "Vender", completá el título, la categoría, el precio y una descripción. Tu publicación aparece al instante.' },
  { q: '¿Puedo devolver un producto?', a: 'Sí, tenés 30 días desde que lo recibís para devolverlo gratis.' },
  { q: '¿Mis datos están seguros?', a: 'Esta es una demo de portfolio: todo queda guardado solo en tu navegador y no se hace ningún cobro.' },
]

const shortcuts = [
  ['/', 'Ir al buscador'],
  ['↑ ↓', 'Moverte entre las sugerencias'],
  ['Enter', 'Buscar'],
  ['Esc', 'Cerrar el carrito o las sugerencias'],
]

export default function Help() {
  const [query, setQuery] = useState('')
  const shown = faqs.filter((f) => normalize(`${f.q} ${f.a}`).includes(normalize(query)))
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold">¿Con qué te podemos ayudar?</h1>
        <label className="mx-auto flex max-w-lg items-center gap-2 rounded-md bg-surface px-4 py-3 shadow-sm">
          <Search size={18} className="text-neutral-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en la ayuda" aria-label="Buscar en la ayuda" className="flex-1 bg-transparent outline-none" />
        </label>
      </div>
      <section className="divide-y divide-neutral-100 rounded-md bg-surface shadow-sm">
        {shown.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {f.q}
              <span className="text-primary transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
          </details>
        ))}
        {shown.length === 0 && <p className="p-5 text-sm text-neutral-500">No encontramos respuestas para "{query}".</p>}
      </section>
      <section id="cupones" className="space-y-3">
        <h2 className="text-xl font-semibold">Cupones vigentes</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {coupons.map((c) => (
            <li key={c.code} className="rounded-md border-2 border-dashed border-primary/40 bg-surface p-4">
              <p className="font-mono text-lg font-bold text-primary">{c.code}</p>
              <p className="text-sm text-neutral-600">{c.description}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-neutral-500">Aplicalos en el <Link to="/carrito" className="text-primary hover:underline">carrito</Link> o en el checkout.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Atajos de teclado</h2>
        <dl className="grid gap-2 rounded-md bg-surface p-5 text-sm shadow-sm sm:grid-cols-2">
          {shortcuts.map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <dt><kbd className="rounded border border-neutral-300 bg-neutral-50 px-2 py-0.5 font-mono text-xs">{key}</kbd></dt>
              <dd className="text-neutral-600">{label}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
