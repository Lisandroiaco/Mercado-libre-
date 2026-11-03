import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-sm text-primary">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <ChevronRight size={12} className="text-neutral-400" />}
          {item.to ? <Link to={item.to} className="hover:underline">{item.label}</Link> : <span className="text-neutral-500">{item.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
