import { CheckCircle2, Package, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ProductImage } from '../components/ProductImage'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/format'
import { formatOrderDate, orderStage, orderStages } from '../lib/orders'
import type { Order } from '../types'
import NotFound from './NotFound'

/** Re-render every 30 s so order statuses advance while the page is open. */
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

function StatusPill({ order, now }: { order: Order; now: Date }) {
  const stage = orderStage(order, now)
  const done = stage === orderStages.length - 1
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${done ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'}`}>
      {order.delivery === 'pickup' && stage === 3 ? 'Retirado' : orderStages[stage]}
    </span>
  )
}

export function OrderList() {
  const { orders, lookup } = useStore()
  const now = useNow()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-800">Mis compras</h1>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md bg-surface p-12 text-center shadow-sm">
          <Package size={48} strokeWidth={1} className="text-neutral-300" />
          <p className="text-lg text-neutral-700">Todavía no hiciste ninguna compra.</p>
          <Link to="/ofertas" className="text-primary hover:underline">Ver ofertas del día</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const first = lookup.get(order.lines[0].productId)
            return (
              <li key={order.id}>
                <Link to={`/mis-compras/${order.id}`} className="flex gap-4 rounded-md bg-surface p-5 shadow-sm transition hover:shadow-md">
                  {first && <ProductImage product={first} className="size-20 shrink-0 rounded" showBrand={false} />}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill order={order} now={now} />
                      <span className="text-xs text-neutral-500">{formatOrderDate(order.date)}</span>
                    </div>
                    <p className="truncate font-medium">{order.lines[0].title}</p>
                    {order.lines.length > 1 && <p className="text-sm text-neutral-500">y {order.lines.length - 1} producto(s) más</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-neutral-500">#{order.id}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const { orders, lookup, dispatch, setCartOpen } = useStore()
  const now = useNow()
  const order = orders.find((o) => o.id === id)
  if (!order) return <NotFound />
  const stage = orderStage(order, now)
  const isNew = sp.get('nueva') === '1'

  const buyAgain = () => {
    for (const l of order.lines) {
      const p = lookup.get(l.productId)
      if (p) dispatch({ type: 'add', productId: p.id, variant: l.variant, quantity: l.quantity, stock: p.stock })
    }
    setCartOpen(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {isNew && (
        <div className="overflow-hidden rounded-md bg-success text-white shadow-sm">
          <div className="flex items-center gap-4 p-6">
            <CheckCircle2 size={48} strokeWidth={1.5} className="shrink-0" />
            <div>
              <h1 className="text-2xl font-semibold">¡Listo! Tu compra está confirmada</h1>
              <p className="opacity-90">Te avisamos por e-mail cada vez que tu paquete avance. Esto es una demo: no se cobró nada.</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/mis-compras" className="text-sm text-primary hover:underline">← Mis compras</Link>
          <h2 className="text-xl font-semibold">Compra #{order.id}</h2>
          <p className="text-sm text-neutral-500">{formatOrderDate(order.date)}</p>
        </div>
        <button type="button" onClick={buyAgain} className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
          <RotateCcw size={16} /> Volver a comprar
        </button>
      </div>

      <section className="rounded-md bg-surface p-6 shadow-sm">
        <h3 className="mb-6 font-semibold">Seguimiento del envío</h3>
        <ol className="grid gap-4 sm:grid-cols-4">
          {orderStages.map((label, i) => (
            <li key={label} className="flex items-center gap-3 sm:flex-col sm:text-center">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i <= stage ? 'bg-success text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                {i < stage ? '✓' : i + 1}
              </span>
              <span className={`text-sm ${i === stage ? 'font-semibold text-success' : i < stage ? 'text-neutral-700' : 'text-neutral-400'}`}>
                {order.delivery === 'pickup' && i === 3 ? 'Retirado' : label}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full bg-success transition-all" style={{ width: `${(stage / (orderStages.length - 1)) * 100}%` }} />
        </div>
        <p className="mt-3 text-xs text-neutral-400">En esta demo la compra avanza sola: en unos 10 minutos figura como entregada.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-md bg-surface p-6 text-sm shadow-sm">
          <h3 className="mb-2 font-semibold">Entrega</h3>
          <p>{order.address.name}</p>
          <p className="text-neutral-600">{order.address.street}, {order.address.city} ({order.address.zip})</p>
          <p className="text-neutral-600">{{ standard: 'Envío a domicilio', express: 'Envío express', pickup: 'Retiro en punto de entrega' }[order.delivery]}</p>
        </section>
        <section className="rounded-md bg-surface p-6 text-sm shadow-sm">
          <h3 className="mb-2 font-semibold">Pago</h3>
          <p className="text-neutral-600">
            {{ card: 'Tarjeta de crédito', transfer: 'Transferencia', cash: 'Efectivo' }[order.payment]}
            {order.payment === 'card' && ` · ${order.installments} ${order.installments === 1 ? 'cuota' : 'cuotas'}`}
          </p>
          <dl className="mt-3 space-y-1">
            <div className="flex justify-between"><dt>Productos</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Envío</dt><dd>{order.shipping ? formatPrice(order.shipping) : 'Gratis'}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><dt>Cupón {order.coupon}</dt><dd>- {formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between border-t border-neutral-100 pt-1 font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="rounded-md bg-surface shadow-sm">
        <h3 className="border-b border-neutral-100 p-5 font-semibold">Productos</h3>
        <ul>
          {order.lines.map((l) => {
            const p = lookup.get(l.productId)
            return (
              <li key={`${l.productId}-${l.variant}`} className="flex items-center gap-4 border-b border-neutral-100 p-5 last:border-0">
                {p && <ProductImage product={p} className="size-14 shrink-0 rounded" showBrand={false} />}
                <div className="min-w-0 flex-1 text-sm">
                  {p ? <Link to={`/producto/${p.id}`} className="hover:text-primary">{l.title}</Link> : l.title}
                  <p className="text-neutral-500">{l.quantity} u.{l.variant ? ` · ${l.variant}` : ''}</p>
                  {p && stage === 3 && <Link to={`/producto/${p.id}#opiniones`} className="text-xs text-primary hover:underline">Opinar sobre el producto</Link>}
                </div>
                <p>{formatPrice(l.price * l.quantity)}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
