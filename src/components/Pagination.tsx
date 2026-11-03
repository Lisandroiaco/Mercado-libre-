import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-1">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="flex items-center gap-1 rounded px-3 py-2 text-sm text-primary disabled:text-neutral-400">
        <ChevronLeft size={16} /> Anterior
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`size-9 rounded text-sm ${n === page ? 'bg-primary/15 font-semibold text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          {n}
        </button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="flex items-center gap-1 rounded px-3 py-2 text-sm text-primary disabled:text-neutral-400">
        Siguiente <ChevronRight size={16} />
      </button>
    </nav>
  )
}
