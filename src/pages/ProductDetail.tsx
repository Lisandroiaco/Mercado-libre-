import { Award, Check, MapPin, MessageCircle, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { FavoriteButton } from '../components/FavoriteButton'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { ProductRow } from '../components/ProductRow'
import { Stars } from '../components/Stars'
import { useStore } from '../context/store'
import { categoryById } from '../data/categories'
import { productById, products } from '../data/products'
import { formatSold } from '../lib/format'
import type { Product, Question } from '../types'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const product = productById.get(id)
  if (!product) return <NotFound />
  // Keyed so local state (selected image, quantity, questions) resets between products.
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }: { product: Product }) {
  const { dispatch, addToHistory } = useStore()
  const navigate = useNavigate()
  const [image, setImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const category = categoryById[product.category]

  useEffect(() => {
    addToHistory(product.id)
    document.title = `${product.title} | Mercadito`
    return () => {
      document.title = 'Mercadito | Comprá y vendé online'
    }
  }, [product, addToHistory])

  const related = useMemo(
    () => products.filter((p) => p.category === product.category && p.id !== product.id),
    [product],
  )

  const addToCart = () => {
    dispatch({ type: 'add', productId: product.id, quantity, stock: product.stock })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const buyNow = () => {
    dispatch({ type: 'add', productId: product.id, quantity, stock: product.stock })
    navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: category.name, to: `/buscar?category=${category.id}` },
          { label: product.brand, to: `/buscar?q=${encodeURIComponent(product.brand)}` },
        ]}
      />

      <div className="mt-3 rounded-md bg-white shadow-sm">
        <div className="grid gap-8 p-4 md:grid-cols-[minmax(0,1fr)_300px] md:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Gallery + info */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
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
              <ProductImage product={product} variant={image} className="aspect-square flex-1 rounded" iconClassName="size-2/5" />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-neutral-500">
                {product.condition === 'nuevo' ? 'Nuevo' : 'Usado'} | {formatSold(product.sold)}
              </p>
              <div className="flex items-start gap-3">
                <h1 className="flex-1 text-xl font-semibold text-neutral-800 sm:text-2xl">{product.title}</h1>
                <FavoriteButton productId={product.id} className="shrink-0" />
              </div>
              <a href="#opiniones" className="flex items-center gap-1 text-sm text-neutral-500">
                {product.rating} <Stars rating={product.rating} /> ({product.reviewsCount})
              </a>
              <Price product={product} size="lg" />
              <details className="text-sm">
                <summary className="cursor-pointer text-primary hover:underline">Ver los medios de pago</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
                  <li>Tarjetas de crédito: Visa, Mastercard, American Express</li>
                  <li>Tarjetas de débito y transferencia bancaria</li>
                  <li>Efectivo en puntos de pago</li>
                </ul>
              </details>

              <div className="pt-2">
                <h2 className="mb-2 font-semibold">Lo que tenés que saber de este producto</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Buy box */}
          <aside className="h-fit space-y-4 rounded-md border border-neutral-200 p-5">
            {product.freeShipping ? (
              <div className="flex gap-2 text-sm">
                <Truck size={20} className="shrink-0 text-success" />
                <div>
                  <p className="font-semibold text-success">Llega gratis mañana</p>
                  <p className="text-neutral-500">Más formas de entrega</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 text-sm">
                <Truck size={20} className="shrink-0 text-neutral-500" />
                <p>Envío a todo el país</p>
              </div>
            )}
            <div className="flex gap-2 text-sm">
              <RotateCcw size={20} className="shrink-0 text-success" />
              <p>
                <span className="font-semibold text-success">Devolución gratis.</span>{' '}
                <span className="text-neutral-500">Tenés 30 días desde que lo recibís.</span>
              </p>
            </div>

            <div>
              <p className="font-semibold">{product.stock > 1 ? 'Stock disponible' : '¡Última disponible!'}</p>
              <label className="mt-2 flex items-center gap-2 text-sm">
                Cantidad:
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded border border-neutral-300 px-2 py-1 font-semibold"
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'unidad' : 'unidades'}
                    </option>
                  ))}
                </select>
                <span className="text-neutral-500">({product.stock} disponibles)</span>
              </label>
            </div>

            <div className="space-y-2">
              <button type="button" onClick={buyNow} className="w-full rounded-md bg-primary py-3 font-semibold text-white hover:bg-primary-dark">
                Comprar ahora
              </button>
              <button
                type="button"
                onClick={addToCart}
                className="flex w-full items-center justify-center gap-1 rounded-md bg-primary/10 py-3 font-semibold text-primary hover:bg-primary/20"
              >
                {added ? (
                  <>
                    <Check size={18} /> Agregado al carrito
                  </>
                ) : (
                  'Agregar al carrito'
                )}
              </button>
              <p role="status" className="sr-only">{added ? 'Producto agregado al carrito' : ''}</p>
              {added && (
                <Link to="/carrito" className="block text-center text-sm text-primary hover:underline">
                  Ir al carrito
                </Link>
              )}
            </div>

            <ul className="space-y-3 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              <li className="flex gap-2">
                <ShieldCheck size={18} className="shrink-0" />
                <span><span className="text-primary">Compra Protegida</span>, recibí el producto que esperabas o te devolvemos tu dinero.</span>
              </li>
              <li className="flex gap-2">
                <Award size={18} className="shrink-0" />
                12 meses de garantía de fábrica.
              </li>
            </ul>

            <div className="border-t border-neutral-100 pt-4 text-sm">
              <p className="font-semibold">Información del vendedor</p>
              <p className="mt-1 text-primary">{product.seller}</p>
              <p className="mt-1 flex items-center gap-1 text-neutral-500">
                <MapPin size={14} /> {product.location}
              </p>
              <div className="mt-3 grid grid-cols-5 gap-1" aria-label="Reputación del vendedor: excelente">
                {['bg-red-200', 'bg-orange-200', 'bg-yellow-200', 'bg-lime-200', 'bg-success'].map((c) => (
                  <span key={c} className={`h-1.5 rounded ${c}`} />
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="space-y-10 border-t border-neutral-100 p-4 md:p-8 md:pr-[348px] xl:pr-[388px]">
          <section>
            <h2 className="mb-4 text-2xl text-neutral-800">Descripción</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-neutral-600">{product.description}</p>
          </section>
          <Questions initial={product.questions} />
          <Reviews product={product} />
        </div>
      </div>

      <div className="mt-10">
        <ProductRow title="Productos relacionados" products={related} />
      </div>
    </div>
  )
}

function Questions({ initial }: { initial: Question[] }) {
  const [questions, setQuestions] = useState(initial)
  const [text, setText] = useState('')

  const ask = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setQuestions((q) => [{ question: text.trim(), date: new Date().toISOString().slice(0, 10) }, ...q])
    setText('')
  }

  return (
    <section className="border-t border-neutral-100 pt-8">
      <h2 className="mb-4 text-2xl text-neutral-800">Preguntas y respuestas</h2>
      <form onSubmit={ask} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí tu pregunta…"
          aria-label="Escribí tu pregunta"
          maxLength={300}
          className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Preguntar
        </button>
      </form>
      <h3 className="mt-6 mb-3 font-semibold">Últimas realizadas</h3>
      <ul className="space-y-4">
        {questions.map((q, i) => (
          <li key={`${q.question}-${i}`} className="text-sm">
            <p className="text-neutral-800">{q.question}</p>
            {q.answer ? (
              <p className="mt-1 flex gap-2 pl-3 text-neutral-500">
                <MessageCircle size={14} className="mt-0.5 shrink-0" /> {q.answer}{' '}
                <span className="text-xs text-neutral-400">{q.date}</span>
              </p>
            ) : (
              <p className="mt-1 pl-3 text-xs text-neutral-400">Esperando respuesta del vendedor</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Reviews({ product }: { product: Product }) {
  // Approximate distribution derived from the average rating, for the bar chart.
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const weight = Math.max(0.02, 1 - Math.abs(product.rating - star) / 2)
    return { star, weight }
  })
  const totalWeight = dist.reduce((s, d) => s + d.weight, 0)

  return (
    <section id="opiniones" className="border-t border-neutral-100 pt-8">
      <h2 className="mb-4 text-2xl text-neutral-800">Opiniones del producto</h2>
      <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
        <div>
          <p className="text-5xl text-primary">{product.rating}</p>
          <Stars rating={product.rating} size={18} />
          <p className="mt-1 text-sm text-neutral-500">{product.reviewsCount} calificaciones</p>
          <ul className="mt-4 space-y-1.5">
            {dist.map(({ star, weight }) => (
              <li key={star} className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="h-1 flex-1 overflow-hidden rounded bg-neutral-200">
                  <span className="block h-full bg-neutral-500" style={{ width: `${(weight / totalWeight) * 100}%` }} />
                </span>
                {star} ★
              </li>
            ))}
          </ul>
        </div>
        <ul className="space-y-6">
          {product.reviews.map((r, i) => (
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
        </ul>
      </div>
    </section>
  )
}
