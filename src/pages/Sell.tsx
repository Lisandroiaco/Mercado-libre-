import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Price } from '../components/Price'
import { ProductImage } from '../components/ProductImage'
import { useStore } from '../context/store'
import { categories } from '../data/categories'
import { createListing } from '../data/products'
import { emptyDraft, validateDraft, type Draft } from '../lib/validation'
import type { CategoryId } from '../types'

export default function Sell() {
  const { user, publishProduct, myListings, removeListing, notify } = useStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<ReturnType<typeof validateDraft>>({})

  const preview = createListing(
    {
      title: draft.title || 'Título de tu publicación',
      category: draft.category,
      brand: draft.brand || 'Marca',
      price: Number(draft.price) || 0,
      condition: draft.condition,
      stock: Number(draft.stock) || 1,
      description: draft.description,
    },
    user?.name ?? 'Tu tienda',
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateDraft(draft)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const product = createListing(
      { ...draft, title: draft.title.trim(), brand: draft.brand.trim(), price: Number(draft.price), stock: Number(draft.stock), description: draft.description.trim() },
      user?.name ?? 'Vendedor particular',
    )
    publishProduct(product)
    notify('¡Tu producto ya está publicado!', { label: 'Ver', to: `/producto/${product.id}` })
    setDraft(emptyDraft)
    navigate(`/producto/${product.id}`)
  }

  const input = (key: keyof Draft, label: string, props: Record<string, unknown> = {}) => (
    <div className="text-sm">
      <label htmlFor={`sell-${key}`} className="text-neutral-600">{label}</label>
      <input
        id={`sell-${key}`}
        value={draft[key]}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `sell-${key}-error` : undefined}
        className={`mt-1 w-full rounded-md border bg-surface px-3 py-2.5 outline-none focus:border-primary ${errors[key] ? 'border-red-500' : 'border-neutral-300'}`}
        {...props}
      />
      {errors[key] && <p id={`sell-${key}-error`} className="mt-1 text-xs text-red-600">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Vendé en Mercadito</h1>
        <p className="text-neutral-500">Publicá un producto y aparece al instante en búsquedas, categorías y la home.</p>
        {!user && (
          <p className="mt-2 text-sm">
            <Link to="/ingresar?volver=/vender" className="text-primary hover:underline">Ingresá</Link> para publicar con tu nombre de vendedor.
          </p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={submit} noValidate className="space-y-4 rounded-md bg-surface p-6 shadow-sm">
          {input('title', 'Título', { placeholder: 'Ej: Celular Samsung Galaxy A55 128 GB Azul', maxLength: 90 })}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-sm">
              <label htmlFor="sell-category" className="text-neutral-600">Categoría</label>
              <select id="sell-category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as CategoryId }))} className="mt-1 w-full rounded-md border border-neutral-300 bg-surface px-3 py-2.5">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {input('brand', 'Marca')}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {input('price', 'Precio ($)', { type: 'number', inputMode: 'numeric', min: 100 })}
            {input('stock', 'Stock', { type: 'number', inputMode: 'numeric', min: 1 })}
            <fieldset className="text-sm">
              <legend className="text-neutral-600">Condición</legend>
              <div className="mt-2 flex gap-4">
                {(['nuevo', 'usado'] as const).map((c) => (
                  <label key={c} className="flex items-center gap-1.5">
                    <input type="radio" name="condition" checked={draft.condition === c} onChange={() => setDraft((d) => ({ ...d, condition: c }))} className="accent-primary" />
                    {c === 'nuevo' ? 'Nuevo' : 'Usado'}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="text-sm">
            <label htmlFor="sell-description" className="text-neutral-600">Descripción</label>
            <textarea
              id="sell-description"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'sell-description-error' : undefined}
              className={`mt-1 w-full rounded-md border bg-surface px-3 py-2.5 outline-none focus:border-primary ${errors.description ? 'border-red-500' : 'border-neutral-300'}`}
            />
            <p className="mt-1 text-right text-xs text-neutral-400">{draft.description.length} caracteres</p>
            {errors.description && <p id="sell-description-error" className="text-xs text-red-600">{errors.description}</p>}
          </div>
          <button type="submit" className="rounded-md bg-primary px-8 py-3 font-semibold text-white hover:bg-primary-dark">Publicar</button>
        </form>

        <aside className="space-y-2">
          <p className="text-sm font-semibold text-neutral-600">Así se va a ver</p>
          <div className="overflow-hidden rounded-md bg-surface shadow-sm">
            <ProductImage product={preview} className="aspect-square" />
            <div className="space-y-1 p-4">
              <p className="line-clamp-2 text-sm text-neutral-700">{preview.title}</p>
              <Price product={preview} />
            </div>
          </div>
        </aside>
      </div>

      {myListings.length > 0 && (
        <section className="rounded-md bg-surface shadow-sm">
          <h2 className="border-b border-neutral-100 p-5 text-lg font-semibold">Tus publicaciones ({myListings.length})</h2>
          <ul>
            {myListings.map((p) => (
              <li key={p.id} className="flex items-center gap-4 border-b border-neutral-100 p-5 last:border-0">
                <ProductImage product={p} className="size-14 shrink-0 rounded" showBrand={false} />
                <Link to={`/producto/${p.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-primary">{p.title}</Link>
                <span className="text-sm text-neutral-500">{p.stock} u.</span>
                <button type="button" aria-label={`Eliminar ${p.title}`} onClick={() => removeListing(p.id)} className="p-1 text-neutral-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
