import { CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/store'

/** Stack of short-lived notifications in the bottom corner. */
export function Toaster() {
  const { toasts, dismissToast } = useStore()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg bg-neutral-900 px-4 py-3 text-sm text-surface shadow-2xl"
        >
          <CheckCircle2 size={18} className="shrink-0 text-success" />
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <Link to={t.action.to} onClick={() => dismissToast(t.id)} className="font-semibold text-primary hover:underline">
              {t.action.label}
            </Link>
          )}
          <button type="button" aria-label="Cerrar notificación" onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
