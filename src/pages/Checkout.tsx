import { CreditCard, Landmark, Lock, Wallet } from 'lucide-react'
import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { detectBrand, formatCardNumber, validateCard, type CardForm } from '../lib/card'
import { formatPrice, installmentValue } from '../lib/format'
import { buildOrder } from '../lib/orders'
import { arrivalLabel, quoteShipping } from '../lib/shipping'
import { emptyAddress, validateAddress, type Address } from '../lib/validation'
import type { DeliveryMethod, PaymentMethod } from '../types'
import { CouponForm, OrderSummary } from './Cart'

type Step = 'shipping' | 'payment' | 'review'

const steps: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Envío' },
  { id: 'payment', label: 'Pago' },
  { id: 'review', label: 'Revisión' },
]

export default function Checkout() {
  const { summary, dispatch, user, placeOrder, setCouponCode } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('shipping')
  const [address, setAddress] = useState<Address>({ ...emptyAddress, name: user?.name ?? '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateAddress>>({})
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard')
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState<CardForm>({ number: '', name: '', expiry: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState<ReturnType<typeof validateCard>>({})
  const [installments, setInstallments] = useState(1)
  const [placing, setPlacing] = useState(false)

  if (summary.lines.length === 0 && !placing) return <Navigate to="/carrito" replace />

  const quotes = quoteShipping(address.zip, summary.shipping === 0) ?? []
  const quote = quotes.find((q) => q.method === delivery) ?? quotes[0]
  const shippingCost = quote ? quote.cost : summary.shipping
  const total = summary.total + shippingCost - summary.discount
  const maxInstallments = Math.min(...summary.lines.map((l) => l.product.installments), 12)
  const current = steps.findIndex((s) => s.id === step)

  const submitAddress = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateAddress(address)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep('payment')
  }

  const submitPayment = (e: FormEvent) => {
    e.preventDefault()
    if (method === 'card') {
      const errs = validateCard(card)
      setCardErrors(errs)
      if (Object.keys(errs).length > 0) return
    }
    setStep('review')
  }

  const confirm = () => {
    setPlacing(true)
    const order = buildOrder(summary.lines, {
      subtotal: summary.total,
      shipping: shippingCost,
      discount: summary.discount,
      total,
      coupon: summary.coupon?.code,
      delivery: quote?.method ?? 'standard',
      payment: method,
      installments: method === 'card' ? installments : 1,
      address,
    })
    placeOrder(order)
    dispatch({ type: 'clear' })
    setCouponCode(null)
    navigate(`/mis-compras/${order.id}?nueva=1`, { replace: true })
  }

  const field = (key: keyof Address, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="text-sm">
      <label htmlFor={`addr-${key}`} className="text-neutral-600">{label}</label>
      <input
        id={`addr-${key}`}
        value={address[key]}
        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `addr-${key}-error` : undefined}
        className={`mt-1 w-full rounded-md border bg-surface px-3 py-2.5 outline-none focus:border-primary ${errors[key] ? 'border-red-500' : 'border-neutral-300'}`}
        {...props}
      />
      {errors[key] && <p id={`addr-${key}-error`} className="mt-1 text-xs text-red-600">{errors[key]}</p>}
    </div>
  )

  const cardField = (key: keyof CardForm, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}, format?: (v: string) => string) => (
    <div className="text-sm">
      <label htmlFor={`card-${key}`} className="text-neutral-600">{label}</label>
      <input
        id={`card-${key}`}
        value={card[key]}
        onChange={(e) => setCard((c) => ({ ...c, [key]: format ? format(e.target.value) : e.target.value }))}
        aria-invalid={!!cardErrors[key]}
        aria-describedby={cardErrors[key] ? `card-${key}-error` : undefined}
        className={`mt-1 w-full rounded-md border bg-surface px-3 py-2.5 outline-none focus:border-primary ${cardErrors[key] ? 'border-red-500' : 'border-neutral-300'}`}
        {...props}
      />
      {cardErrors[key] && <p id={`card-${key}-error`} className="mt-1 text-xs text-red-600">{cardErrors[key]}</p>}
    </div>
  )

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={i >= current}
                onClick={() => setStep(s.id)}
                className={`grid size-6 place-items-center rounded-full text-xs font-bold text-white ${i <= current ? 'bg-primary' : 'bg-neutral-300'}`}
                aria-label={`Paso ${i + 1}: ${s.label}`}
              >
                {i + 1}
              </button>
              <span className={i === current ? 'font-semibold' : 'text-neutral-500'}>{s.label}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-neutral-300" />}
            </li>
          ))}
        </ol>

        {step === 'shipping' && (
          <form onSubmit={submitAddress} noValidate className="space-y-4 rounded-md bg-surface p-6 shadow-sm">
            <h1 className="text-xl font-semibold">¿Dónde querés recibir tu compra?</h1>
            {field('name', 'Nombre y apellido', { autoComplete: 'name' })}
            {field('street', 'Calle y número', { autoComplete: 'street-address' })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('city', 'Localidad', { autoComplete: 'address-level2' })}
              {field('zip', 'Código postal', { autoComplete: 'postal-code', inputMode: 'numeric' })}
            </div>
            {field('phone', 'Teléfono de contacto', { autoComplete: 'tel', type: 'tel' })}

            {quotes.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="mb-2 font-semibold">Forma de entrega</legend>
                {quotes.map((q) => (
                  <label key={q.method} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${delivery === q.method ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}>
                    <input type="radio" name="delivery" checked={delivery === q.method} onChange={() => setDelivery(q.method)} className="accent-primary" />
                    <span className="flex-1">
                      <span className="block font-medium">{q.label}</span>
                      <span className="text-neutral-500">{arrivalLabel(q.days)}</span>
                    </span>
                    <span className={q.cost === 0 ? 'font-semibold text-success' : ''}>{q.cost === 0 ? 'Gratis' : formatPrice(q.cost)}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <button type="submit" className="rounded-md bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark">Continuar</button>
          </form>
        )}

        {step === 'payment' && (
          <form onSubmit={submitPayment} noValidate className="space-y-4 rounded-md bg-surface p-6 shadow-sm">
            <h1 className="text-xl font-semibold">¿Cómo querés pagar?</h1>
            <fieldset className="space-y-2">
              <legend className="sr-only">Medio de pago</legend>
              {([
                ['card', CreditCard, 'Tarjeta de crédito', `Hasta ${maxInstallments} cuotas sin interés`],
                ['transfer', Landmark, 'Transferencia bancaria', 'Se acredita al instante'],
                ['cash', Wallet, 'Efectivo', 'En puntos de pago habilitados'],
              ] as const).map(([id, Icon, title, text]) => (
                <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 ${method === id ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}>
                  <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="accent-primary" />
                  <Icon className="text-primary" />
                  <span>
                    <span className="block font-medium">{title}</span>
                    <span className="text-sm text-neutral-500">{text}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {method === 'card' && (
              <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                <CardPreview card={card} />
                <div className="space-y-3">
                  {cardField('number', 'Número de tarjeta', { inputMode: 'numeric', autoComplete: 'cc-number', placeholder: '4509 9535 6623 3704' }, formatCardNumber)}
                  {cardField('name', 'Nombre del titular', { autoComplete: 'cc-name' })}
                  <div className="grid grid-cols-2 gap-3">
                    {cardField('expiry', 'Vencimiento', { placeholder: 'MM/AA', autoComplete: 'cc-exp', inputMode: 'numeric' }, (v) => {
                      const d = v.replace(/\D/g, '').slice(0, 4)
                      return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
                    })}
                    {cardField('cvv', 'Código de seguridad', { inputMode: 'numeric', autoComplete: 'cc-csc', maxLength: 4 }, (v) => v.replace(/\D/g, ''))}
                  </div>
                  <label className="block text-sm">
                    <span className="text-neutral-600">Cuotas</span>
                    <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="mt-1 w-full rounded-md border border-neutral-300 bg-surface px-3 py-2.5">
                      {[1, 3, 6, 12].filter((n) => n <= maxInstallments).map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'} de {formatPrice(installmentValue(total, n))} sin interés</option>
                      ))}
                    </select>
                  </label>
                  <p className="flex items-center gap-1 text-xs text-neutral-500">
                    <Lock size={12} /> Demo: usá una tarjeta de prueba como 4509 9535 6623 3704. No se cobra nada.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('shipping')} className="rounded-md px-6 py-3 font-semibold text-primary hover:bg-primary/10">Volver</button>
              <button type="submit" className="rounded-md bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark">Continuar</button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-4 rounded-md bg-surface p-6 shadow-sm">
            <h1 className="text-xl font-semibold">Revisá y confirmá tu compra</h1>
            <div className="rounded-md border border-neutral-200 p-4 text-sm">
              <p className="font-semibold">{quote?.label ?? 'Envío a domicilio'}</p>
              {quote && <p className="text-success">{arrivalLabel(quote.days)}</p>}
              <p className="text-neutral-600">{address.street}, {address.city} ({address.zip})</p>
              <p className="text-neutral-600">{address.name} · {address.phone}</p>
              <button type="button" onClick={() => setStep('shipping')} className="mt-1 text-primary hover:underline">Modificar</button>
            </div>
            <div className="rounded-md border border-neutral-200 p-4 text-sm">
              <p className="font-semibold">Pago</p>
              <p className="text-neutral-600">
                {method === 'card'
                  ? `Tarjeta ${detectBrand(card.number)} terminada en ${card.number.replace(/\D/g, '').slice(-4)} · ${installments} ${installments === 1 ? 'cuota' : 'cuotas'} de ${formatPrice(installmentValue(total, installments))}`
                  : method === 'transfer'
                    ? 'Transferencia bancaria'
                    : 'Efectivo en puntos de pago'}
              </p>
              <button type="button" onClick={() => setStep('payment')} className="mt-1 text-primary hover:underline">Modificar</button>
            </div>
            <ul className="divide-y divide-neutral-100 text-sm">
              {summary.lines.map((l) => (
                <li key={`${l.product.id}-${l.variant}`} className="flex justify-between gap-4 py-2">
                  <span className="text-neutral-700">{l.quantity} × {l.product.title}{l.variant ? ` (${l.variant})` : ''}</span>
                  <span className="shrink-0">{formatPrice(l.subtotal)}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={confirm} className="w-full rounded-md bg-primary py-3 font-semibold text-white hover:bg-primary-dark">
              Confirmar compra
            </button>
          </div>
        )}
      </div>
      <OrderSummary shippingOverride={shippingCost}>
        <CouponForm />
      </OrderSummary>
    </div>
  )
}

/** Live preview of the card being typed, with the network detected from the number. */
function CardPreview({ card }: { card: CardForm }) {
  const brand = detectBrand(card.number)
  const gradient = {
    visa: 'from-[#1a1f71] to-[#3483fa]',
    mastercard: 'from-[#eb001b] to-[#f79e1b]',
    amex: 'from-[#2e77bb] to-[#6fc3e8]',
    desconocida: 'from-neutral-600 to-neutral-800',
  }[brand]
  return (
    <div aria-hidden className={`flex aspect-[1.586] w-full max-w-[260px] flex-col justify-between rounded-xl bg-gradient-to-br p-4 text-white shadow-lg ${gradient}`}>
      <div className="flex justify-between">
        <span className="h-7 w-10 rounded bg-yellow-200/80" />
        <span className="text-sm font-bold uppercase italic">{brand === 'desconocida' ? '' : brand}</span>
      </div>
      <p className="whitespace-nowrap font-mono text-[15px] tracking-wider">{card.number || '•••• •••• •••• ••••'}</p>
      <div className="flex justify-between text-xs uppercase">
        <span className="truncate">{card.name || 'Nombre del titular'}</span>
        <span>{card.expiry || 'MM/AA'}</span>
      </div>
    </div>
  )
}
