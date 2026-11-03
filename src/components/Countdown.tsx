import { useEffect, useState } from 'react'
import { msUntilMidnight } from '../lib/format'

export function Countdown({ className = '' }: { className?: string }) {
  const [ms, setMs] = useState(() => msUntilMidnight())
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])
  const total = Math.floor(ms / 1000)
  const parts = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((n) => String(n).padStart(2, '0'))
  return (
    <span className={`inline-flex items-center gap-1 font-mono tabular-nums ${className}`} aria-label={`Termina en ${parts[0]} horas y ${parts[1]} minutos`}>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-surface">{p}</span>
          {i < 2 && <span>:</span>}
        </span>
      ))}
    </span>
  )
}
