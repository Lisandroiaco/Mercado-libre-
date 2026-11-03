import { Award, Check, GitCompareArrows, Link2, MapPin, MessageCircle, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { FavoriteButton } from '../components/FavoriteButton'
import { PriceChart } from '../components/PriceChart'
import { Price } from '../components/Price'
import { ProductBadge } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { ProductRow } from '../components/ProductRow'
import { Stars } from '../components/Stars'
import { useStore } from '../context/store'
import { categoryById } from '../data/categories'
import { priceHistory } from '../data/products'
import { formatPrice, formatSold } from '../lib/format'
import { arrivalLabel, quoteShipping } from '../lib/shipping'
import type { Product, Question, Review } from '../types'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const { lookup } = useStore()
  const product = lookup.get(id)
  if (!product) return <NotFound />
  // Keyed so local state (selected image, quantity, questions) resets between products.
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }: { product: Product }) {
  const { dispatch, addToHistory, setCartOpen, catalog, compare, toggleCompare, notify } = useStore()
  const navigate = useNavigate()
  const [image, setImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [variant, setVariant] = useState(product.variants?.options[0])
  const category = categoryById[product.category]

  useEffect(() => {
    addToHistory(product.id)
    document.title = `${product.title} | Mercadito`
    return () => {
      document.title = 'Mercadito | Comprá y vendé online'
    }
  }, [product, addToHistory])

  const related = useMemo(() => catalog.filter((p) => p.category === product.category && p.id !== product.id), [catalog, product])
  const fromSeller = useMemo(() => catalog.filter((p) => p.seller === product.seller && p.id !== product.id), [catalog, product])

  const add = () => dispatch({ type: 'add', productId: product.id, variant, quantity, stock: product.stock })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}`)
      notify('Link copiado al portapapeles')
    } catch {
      notify('No pudimos copiar el link')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb
          items={[
            { label: 'Inicio', to: '/' },
            { label: category.name, to: `/buscar?category=${category.id}` },
            { label: product.brand, to: `/buscar?q=${encodeURIComponent(product.brand)}` },
          ]}
        />
        <div className="flex gap-4 text-sm">
          <button type="button" onClick={() => toggleCompare(product.id)} className="flex items-center gap-1 text-primary hover:underline">
            <GitCompareArrows size={14} /> {compare.includes(product.id) ? 'Quitar del comparador' : 'Comparar'}
          </button>
          <button type="button" onClick={copyLink} className="flex items-center gap-1 text-primary hover:underline">
            <Link2 size={14} /> Compartir
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-surface shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 p-4 md:grid-cols-[minmax(0,1fr)_300px] md:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseEnter={() => setImage(v)}
                    onClick={() => setImage(v)}
                    aria-label={`Ver imagen ${v + 1}`}
                    className={`overflow-hidden rounded border-2 ${v === image ? 'border-primary' : 'border-neutral-200'}`}
                  >
                    <ProductImage product={product} variant={v} className="size-12" showBrand={false} />
                  </button>
                ))}
              </div>
              <ZoomImage product={product} variant={image} />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                {product.condition === 'nuevo' ? 'Nuevo' : 'Usado'} | {formatSold(product.sold)}
              </p>
              <ProductBadge product={product} />
              <div className="flex items-start gap-3">
                <h1 className="flex-1 text-xl font-semibold text-neutral-800 sm:text-2xl">{product.title}</h1>
                <FavoriteButton productId={product.id} className="shrink-0" />
              </div>
              {product.reviewsCount > 0 && (
                <a href="#opiniones" className="flex items-center gap-1 text-sm text-neutral-500">
                  {product.rating} <Stars rating={product.rating} /> ({product.reviewsCount})
                </a>
              )}
              <Price product={product} size="lg" />
              <details className="text-sm">
                <summary className="cursor-pointer text-primary hover:underline">Ver los medios de pago</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
                  <li>Tarjetas de crédito: Visa, Mastercard, American Express</li>
                  <li>Tarjetas de débito y transferencia bancaria</li>
                  <li>Efectivo en puntos de pago</li>
                </ul>
              </details>

              {product.variants && (
                <fieldset>
                  <legend className="mb-2 text-sm">
                    {product.variants.name}: <b>{variant}</b>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setVariant(opt)}
                        aria-pressed={variant === opt}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${variant === opt ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-neutral-300 hover:border-neutral-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="pt-2">
                <h2 className="mb-2 font-semibold">Lo que tenés que saber de este producto</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <li key={k}>{k}: {v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-md border border-neutral-200 p-5">
            <ShippingCalculator product={product} />
            <div className="flex gap-2 text-sm">
              <RotateCcw size={20} className="shrink-0 text-success" />
              <p>
                <span className="font-semibold text-success">Devolución gratis.</span>{' '}
                <span className="text-neutral-500">Tenés 30 días desde que lo recibís.</span>
              </p>
            </div>

            <div>
              <p className="font-semibold">{product.stock > 1 ? 'Stock disponible' : '¡Última disponible!'}</p>
              <label className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                Cantidad:
                <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded border border-neutral-300 bg-surface px-2 py-1 font-semibold">
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'unidad' : 'unidades'}</option>
                  ))}
                </select>
                <span className="text-neutral-500">({product.stock} disponibles)</span>
              </label>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  add()
                  navigate('/checkout')
                }}
                className="w-full rounded-md bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark active:scale-[0.99]"
              >
                Comprar ahora
              </button>
              <button
                type="button"
                onClick={() => {
                  add()
                  setCartOpen(true)
                }}
                className="w-full rounded-md bg-primary/10 py-3 font-semibold text-primary transition hover:bg-primary/20 active:scale-[0.99]"
              >
                Agregar al carrito
              </button>
            </div>

            <ul className="space-y-3 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              <li className="flex gap-2">
                <ShieldCheck size={18} className="shrink-0" />
                <span><span className="text-primary">Compra Protegida</span>, recibí el producto que esperabas o te devolvemos tu dinero.</span>
              </li>
              <li className="flex gap-2">
                <Award size={18} className="shrink-0" /> 12 meses de garantía de fábrica.
              </li>
            </ul>

            <div className="border-t border-neutral-100 pt-4 text-sm">
              <p className="font-semibold">Información del vendedor</p>
              <Link to={`/vendedor/${encodeURIComponent(product.seller)}`} className="mt-1 block text-primary hover:underline">{product.seller}</Link>
              <p className="mt-1 flex items-center gap-1 text-neutral-500"><MapPin size={14} /> {product.location}</p>
              <div className="mt-3 grid grid-cols-5 gap-1" aria-label="Reputación del vendedor: excelente">
                {['bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-lime-200', 'bg-success'].map((c) => (
                  <span key={c} className={`h-1.5 rounded ${c}`} />
                ))}
              </div>
              <Link to={`/vendedor/${encodeURIComponent(product.seller)}`} className="mt-3 block text-primary hover:underline">Ver más datos de este vendedor</Link>
            </div>
          </aside>
        </div>

        <div className="space-y-10 border-t border-neutral-100 p-4 md:p-8 md:pr-[348px] xl:pr-[388px]">
          <BoughtTogether product={product} />
          <section>
            <h2 className="mb-4 text-2xl text-neutral-800">Descripción</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-neutral-600">{product.description}</p>
          </section>
          <section className="border-t border-neutral-100 pt-8">
            <h2 className="mb-4 text-2xl text-neutral-800">Historial de precios</h2>
            <PriceChart points={priceHistory(product)} />
          </section>
          <Questions initial={product.questions} />
          <Reviews product={product} />
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <ProductRow title="Productos relacionados" products={related} />
        <ProductRow title="Más productos del vendedor" products={fromSeller} />
      </div>
    </div>
  )
}

/** Main image that zooms in following the pointer. */
function ZoomImage({ product, variant }: { product: Product; variant: number }) {
  const [origin, setOrigin] = useState<string | null>(null)
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <div className="aspect-square min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded" onMouseMove={move} onMouseLeave={() => setOrigin(null)}>
      <div className="size-full transition-transform duration-200" style={{ transform: origin ? 'scale(1.8)' : 'none', transformOrigin: origin ?? 'center' }}>
        <ProductImage product={product} variant={variant} className="size-full" iconClassName="size-2/5" />
      </div>
    </div>
  )
}

function ShippingCalculator({ product }: { product: Product }) {
  const [zip, setZip] = useState('')
  const [submitted, setSubmitted] = useState('')
  const quotes = submitted ? quoteShipping(submitted, product.freeShipping) : null

  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-2">
        <Truck size={20} className={`shrink-0 ${product.freeShipping ? 'text-success' : 'text-neutral-500'}`} />
        <div>
          {product.freeShipping ? <p className="font-semibold text-success">Envío gratis a todo el país</p> : <p>Envío a todo el país</p>}
          <p className="text-neutral-500">Calculá cuándo llega</p>
        </div>
      </div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          setSubmitted(zip)
        }}
        className="flex gap-2"
      >
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Código postal"
          aria-label="Código postal"
          inputMode="numeric"
          maxLength={8}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-surface px-3 py-1.5 outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-md px-3 font-semibold text-primary hover:bg-primary/10">Calcular</button>
      </form>
      {submitted && !quotes && <p className="text-xs text-red-500">Ingresá un código postal válido, por ejemplo 1425.</p>}
      {quotes && (
        <ul className="space-y-1.5 rounded-md bg-neutral-50 p-3">
          {quotes.map((q) => (
            <li key={q.method} className="flex justify-between gap-2">
              <span>
                <span className="block">{q.label}</span>
                <span className="text-xs text-neutral-500">{arrivalLabel(q.days)}</span>
              </span>
              <span className={q.cost === 0 ? 'font-semibold text-success' : ''}>{q.cost === 0 ? 'Gratis' : formatPrice(q.cost)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Suggests the two best-selling cheaper products from the same category as a bundle. */
function BoughtTogether({ product }: { product: Product }) {
  const { catalog, dispatch, setCartOpen } = useStore()
  const extras = useMemo(
    () =>
      catalog
        .filter((p) => p.id !== product.id && p.category === product.category && p.price < product.price)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 2),
    [catalog, product],
  )
  if (extras.length === 0) return null
  const bundle = [product, ...extras]
  const total = bundle.reduce((s, p) => s + p.price, 0)

  return (
    <section>
      <h2 className="mb-4 text-2xl text-neutral-800">Comprados juntos frecuentemente</h2>
      <div className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {bundle.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              {i > 0 && <Plus size={18} className="text-neutral-400" />}
              <Link to={`/producto/${p.id}`} className="w-28 text-xs">
                <ProductImage product={p} className="mb-1 aspect-square rounded" showBrand={false} />
                <span className="line-clamp-2 text-neutral-600">{p.title}</span>
                <span className="font-semibold">{formatPrice(p.price)}</span>
              </Link>
            </div>
          ))}
        </div>
        <div className="space-y-2 sm:w-48">
          <p className="text-sm text-neutral-500">Precio total</p>
          <p className="text-2xl">{formatPrice(total)}</p>
          <button
            type="button"
            onClick={() => {
              for (const p of bundle) dispatch({ type: 'add', productId: p.id, variant: p.variants?.options[0], quantity: 1, stock: p.stock })
              setCartOpen(true)
            }}
            className="w-full rounded-md bg-primary/10 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
          >
            Agregar los {bundle.length} al carrito
          </button>
        </div>
      </div>
    </section>
  )
}

function Questions({ initial }: { initial: Question[] }) {
  const [questions, setQuestions] = useState(initial)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('')

  const ask = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setQuestions((q) => [{ question: text.trim(), date: new Date().toISOString().slice(0, 10) }, ...q])
    setText('')
  }
  const shown = questions.filter((q) => `${q.question} ${q.answer ?? ''}`.toLowerCase().includes(filter.toLowerCase()))

  return (
    <section className="border-t border-neutral-100 pt-8">
      <h2 className="mb-4 text-2xl text-neutral-800">Preguntas y respuestas</h2>
      <p className="mb-2 text-sm font-semibold">¿Qué querés saber?</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {['Costo y tiempo de envío', 'Devoluciones gratis', 'Medios de pago', 'Garantía'].map((chip) => (
          <button key={chip} type="button" onClick={() => setText(`Hola, ¿me podés contar sobre ${chip.toLowerCase()}?`)} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20">
            {chip}
          </button>
        ))}
      </div>
      <form onSubmit={ask} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu pregunta…"
          aria-label="Escribí tu pregunta"
          maxLength={300}
          className="flex-1 rounded-md border border-neutral-300 bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Preguntar</button>
      </form>
      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Últimas realizadas</h3>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar en preguntas"
          aria-label="Buscar en preguntas"
          className="rounded-md border border-neutral-300 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <ul className="space-y-4">
        {shown.map((q, i) => (
          <li key={`${q.question}-${i}`} className="text-sm">
            <p className="text-neutral-800">{q.question}</p>
            {q.answer ? (
              <p className="mt-1 flex gap-2 pl-3 text-neutral-500">
                <MessageCircle size={14} className="mt-0.5 shrink-0" /> {q.answer} <span className="text-xs text-neutral-400">{q.date}</span>
              </p>
            ) : (
              <p className="mt-1 pl-3 text-xs text-neutral-400">Esperando respuesta del vendedor</p>
            )}
          </li>
        ))}
        {shown.length === 0 && <li className="text-sm text-neutral-500">No hay preguntas que coincidan.</li>}
      </ul>
    </section>
  )
}

function Reviews({ product }: { product: Product }) {
  const { myReviews, addReview, user, notify } = useStore()
  const all = useMemo(() => [...(myReviews[product.id] ?? []), ...product.reviews], [myReviews, product])
  const [stars, setStars] = useState<number | null>(null)
  const [writing, setWriting] = useState(false)

  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, weight: Math.max(0.02, 1 - Math.abs((product.rating || 5) - star) / 2) }))
  const totalWeight = dist.reduce((s, d) => s + d.weight, 0)
  const shown = stars ? all.filter((r) => r.rating === stars) : all

  return (
    <section id="opiniones" className="border-t border-neutral-100 pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl text-neutral-800">Opiniones del producto</h2>
        <button type="button" onClick={() => setWriting((w) => !w)} className="text-sm font-semibold text-primary hover:underline">
          {writing ? 'Cancelar' : 'Escribir una opinión'}
        </button>
      </div>
      {writing && (
        <ReviewForm
          defaultAuthor={user?.name ?? ''}
          onSubmit={(review) => {
            addReview(product.id, review)
            setWriting(false)
            notify('¡Gracias por tu opinión!')
          }}
        />
      )}
      <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
        <div>
          <p className="text-5xl text-primary">{product.rating || '—'}</p>
          <Stars rating={product.rating} size={18} />
          <p className="mt-1 text-sm text-neutral-500">{product.reviewsCount + (myReviews[product.id]?.length ?? 0)} calificaciones</p>
          <ul className="mt-4 space-y-1.5">
            {dist.map(({ star, weight }) => (
              <li key={star}>
                <button type="button" onClick={() => setStars(stars === star ? null : star)} className={`flex w-full items-center gap-2 text-xs ${stars === star ? 'font-bold text-primary' : 'text-neutral-500'}`}>
                  <span className="h-1 flex-1 overflow-hidden rounded bg-neutral-200">
                    <span className="block h-full bg-neutral-500" style={{ width: `${(weight / totalWeight) * 100}%` }} />
                  </span>
                  {star} ★
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[null, 5, 4, 3, 2, 1].map((s) => (
              <button
                key={s ?? 'all'}
                type="button"
                onClick={() => setStars(s)}
                aria-pressed={stars === s}
                className={`rounded-full px-3 py-1 text-xs ${stars === s ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600'}`}
              >
                {s ? `${s} ★` : 'Todas'}
              </button>
            ))}
          </div>
          <ul className="space-y-6">
            {shown.map((r, i) => (
              <li key={i}>
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-neutral-400">{r.date}</span>
                </div>
                <p className="mt-1 font-semibold text-neutral-800">{r.title}</p>
                <p className="text-sm text-neutral-600">{r.body}</p>
                <p className="mt-1 text-xs text-neutral-400">{r.author}</p>
              </li>
            ))}
            {shown.length === 0 && <li className="text-sm text-neutral-500">No hay opiniones con esa calificación.</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}

function ReviewForm({ defaultAuthor, onSubmit }: { defaultAuthor: string; onSubmit: (r: Review) => void }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState(defaultAuthor)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!rating) return setError('Elegí una calificación de 1 a 5 estrellas.')
    if (body.trim().length < 10) return setError('Contanos un poco más (mínimo 10 caracteres).')
    onSubmit({
      rating,
      title: title.trim() || ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][rating - 1],
      body: body.trim(),
      author: author.trim() || 'Comprador',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <form onSubmit={submit} className="mb-8 space-y-3 rounded-md bg-neutral-50 p-4">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} estrellas`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className={`text-3xl leading-none transition ${(hover || rating) >= n ? 'text-primary' : 'text-neutral-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" aria-label="Título de la opinión" className="w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="¿Qué te pareció el producto?" aria-label="Tu opinión" rows={3} className="w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tu nombre" aria-label="Tu nombre" className="w-full rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm" />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
        <Check size={14} className="mr-1 inline" /> Publicar opinión
      </button>
    </form>
  )
}
