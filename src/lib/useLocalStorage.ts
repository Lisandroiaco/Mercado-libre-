import { useEffect, useState } from 'react'

/** useState that persists to localStorage. Falls back silently if storage is unavailable. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked: keep in memory only */
    }
  }, [key, value])

  return [value, setValue] as const
}
