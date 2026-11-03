import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface Props {
  title: string
  action?: ReactNode
  products: Product[]
}

/** Horizontally scrollable shelf of product cards. */
export function ProductRow({ title, action, products }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: 'smooth' })

  if (products.length === 0) return null
  return (
    <section className="relative">
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-semibold text-neutral-700 sm:text-2xl">{title}</h2>
        {action}
      </div>
      <div className="group relative">
        <div ref={scroller} className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
          {products.map((prod) => (
            <div key={prod.id} className="w-44 shrink-0 snap-start sm:w-56">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
        {[-1, 1].map((dir) => (
          <button
            key={dir}
            type="button"
            aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
            onClick={() => scroll(dir as 1 | -1)}
            className={`absolute top-1/3 hidden size-12 place-items-center rounded-full bg-white text-primary shadow-lg transition hover:scale-105 md:grid ${
              dir < 0 ? '-left-5' : '-right-5'
            }`}
          >
            {dir < 0 ? <ChevronLeft /> : <ChevronRight />}
          </button>
        ))}
      </div>
    </section>
  )
}
