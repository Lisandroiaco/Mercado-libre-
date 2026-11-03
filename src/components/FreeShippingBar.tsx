import { Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '../lib/cart'
import { formatPrice } from '../lib/format'

export function FreeShippingBar({ missing }: { missing: number }) {
  const progress = Math.min(100, ((FREE_SHIPPING_THRESHOLD - missing) / FREE_SHIPPING_THRESHOLD) * 100)
  return (
    <div className="space-y-1.5 text-sm">
      <p className="flex items-center gap-1.5">
        <Truck size={16} className="text-success" />
        {missing > 0 ? (
          <span>
            Sumá <b>{formatPrice(missing)}</b> para tener <span className="font-semibold text-success">envío gratis</span>
          </span>
        ) : (
          <span className="font-semibold text-success">¡Tenés envío gratis!</span>
        )}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso hacia envío gratis">
        <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
