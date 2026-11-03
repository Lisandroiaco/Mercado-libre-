import { CheckCircle2, CreditCard, Landmark, Wallet } from 'lucide-react'
import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../context/store'
import { formatPrice, installmentValue } from '../lib/format'
import { emptyAddress, validateAddress, type Address } from '../lib/validation'
import { OrderSummary } from './Cart'

type Step = 'shipping' | 'payment' | 'review'
type PaymentMethod = 'card' | 'transfer' | 'cash'

export default function Checkout() {
  const { summary, dispatch } = useStore()
  const [step, setStep] = useState<Step>('shipping')
  const [address, setAddress] = useState<Address>(emptyAddress)
  const [errors, setErrors] = useState<ReturnType<typeof validateAddress>>({})
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [installments, setInstallments] = useState(1)
  const [orderId, setOrderId] = useState<string | null>(null)

  if (orderId) return <Success orderId={orderId} />
  if (summary.lines.length === 0) return <Navigate to="/carrito" replace />

  const maxInstallments = Math.min(...summary.lines.map((l) => l.product.installments))

  const submitAddress = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateAddress(address)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep('payment')
  }

  const confirm = () => {
    setOrderId(`${Date.now()}`.slice(-8))
    dispatch({ type: 'clear' })
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
        className={`mt-1 w-full rounded-md border px-3 py-2.5 outline-none focus:border-primary ${errors[key] ? 'border-red-500' : 'border-neutral-300'}`}
        {...props}
      />
      {errors[key] && <p id={`addr-${key}-error`} className="mt-1 text-xs text-red-600">{errors[key]}</p>}
    </div>
  )

  const steps: { id: Step; label: string }[] = [
    { id: 'shipping', label: 'Envío' },
    { id: 'payment', label: 'Pago' },
    { id: 'review', label: 'Revisión' },
  ]
  const current = steps.findIndex((s) => s.id === step)

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <ol className="flex items-center gap-2 text-sm">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${i <= current ? 'bg-primary text-white' : 'bg-neutral-300 text-white'}`}>
                {i + 1}
              </span>
              <span className={i === current ? 'font-semibold' : 'text-neutral-500'}>{s.label}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-neutral-300" />}
            </li>
          ))}
        </ol>

        {step === 'shipping' && (
          <form onSubmit={submitAddress} noValidate className="space-y-4 rounded-md bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold">¿Dónde querés recibir tu compra?</h1>
            {field('name', 'Nombre y apellido', { autoComplete: 'name' })}
            {field('street', 'Calle y número', { autoComplete: 'street-address' })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('city', 'Localidad', { autoComplete: 'address-level2' })}
              {field('zip', 'Código postal', { autoComplete: 'postal-code', inputMode: 'numeric' })}
            </div>
            {field('phone', 'Teléfono de contacto', { autoComplete: 'tel', type: 'tel' })}
            <button type="submit" className="rounded-md bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark">
              Continuar
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4 rounded-md bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold">¿Cómo querés pagar?</h1>
            <fieldset className="space-y-2">
              <legend className="sr-only">Medio de pago</legend>
              {([
                ['card', CreditCard, 'Tarjeta de crédito', `Hasta ${maxInstallments} cuotas sin interés`],
                ['transfer', Landmark, 'Transferencia bancaria', 'Se acredita al instante'],
                ['cash', Wallet, 'Efectivo', 'En puntos de pago habilitados'],
              ] as const).map(([id, Icon, title, text]) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 ${method === id ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}
                >
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
              <label className="block text-sm">
                <span className="text-neutral-600">Cuotas</span>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2.5"
                >
                  {[1, 3, 6, 12].filter((n) => n <= maxInstallments).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'cuota' : 'cuotas'} de {formatPrice(installmentValue(summary.grandTotal, n))} sin interés
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('shipping')} className="rounded-md px-6 py-3 font-semibold text-primary hover:bg-primary/10">
                Volver
              </button>
              <button type="button" onClick={() => setStep('review')} className="rounded-md bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark">
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 rounded-md bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold">Revisá y confirmá tu compra</h1>
            <div className="rounded-md border border-neutral-200 p-4 text-sm">
              <p className="font-semibold">Envío a domicilio</p>
              <p className="text-neutral-600">
                {address.street}, {address.city} ({address.zip})
              </p>
              <p className="text-neutral-600">{address.name} · {address.phone}</p>
              <button type="button" onClick={() => setStep('shipping')} className="mt-1 text-primary hover:underline">Modificar</button>
            </div>
            <div className="rounded-md border border-neutral-200 p-4 text-sm">
              <p className="font-semibold">Pago</p>
              <p className="text-neutral-600">
                {method === 'card'
                  ? `Tarjeta de crédito · ${installments} ${installments === 1 ? 'cuota' : 'cuotas'} de ${formatPrice(installmentValue(summary.grandTotal, installments))}`
                  : method === 'transfer'
                    ? 'Transferencia bancaria'
                    : 'Efectivo en puntos de pago'}
              </p>
              <button type="button" onClick={() => setStep('payment')} className="mt-1 text-primary hover:underline">Modificar</button>
            </div>
            <ul className="divide-y divide-neutral-100 text-sm">
              {summary.lines.map((l) => (
                <li key={l.product.id} className="flex justify-between gap-4 py-2">
                  <span className="text-neutral-700">{l.quantity} × {l.product.title}</span>
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
      <OrderSummary />
    </div>
  )
}

function Success({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="overflow-hidden rounded-md bg-white text-center shadow-sm">
        <div className="bg-success px-6 py-10 text-white">
          <CheckCircle2 size={64} className="mx-auto" strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-semibold">¡Listo! Tu compra está confirmada</h1>
        </div>
        <div className="space-y-3 p-8 text-sm text-neutral-600">
          <p>Número de orden <b className="text-neutral-800">#{orderId}</b></p>
          <p>Te avisaremos cuando el vendedor despache tu paquete.</p>
          <p className="text-xs text-neutral-400">Esto es una demo: no se realizó ningún cobro.</p>
          <Link to="/" className="mt-4 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
