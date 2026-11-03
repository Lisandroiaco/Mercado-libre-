import { Clock, Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/store'
import { suggest } from '../lib/search'

/** Header search with autocomplete, recent searches, keyboard navigation and a "/" shortcut. */
export function SearchBox() {
  const { catalog, recentSearches, addSearch, clearSearches } = useStore()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()

  // Sync the box with the URL on navigation (e.g. back button).
  const [lastKey, setLastKey] = useState(location.key)
  if (lastKey !== location.key) {
    setLastKey(location.key)
    setQuery(params.get('q') ?? '')
    setOpen(false)
  }

  // "/" focuses the search from anywhere, like many big sites.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const suggestions = useMemo(() => suggest(query, catalog), [query, catalog])
  const showingRecent = query.trim().length < 2
  const items = showingRecent ? recentSearches : suggestions

  const go = (q: string) => {
    const term = q.trim()
    if (term) addSearch(term)
    setOpen(false)
    input.current?.blur()
    navigate(term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    go(active >= 0 && items[active] ? items[active] : query)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <form onSubmit={submit} role="search" className="relative flex h-10 min-w-0 flex-1 items-center rounded bg-surface shadow">
      <input
        ref={input}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        placeholder="Buscar productos, marcas y más…"
        aria-label="Buscar"
        role="combobox"
        aria-expanded={open && items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className="h-full min-w-0 flex-1 rounded-l bg-transparent px-4 text-sm outline-none placeholder:text-neutral-400"
      />
      {query && (
        <button type="button" aria-label="Borrar búsqueda" onClick={() => { setQuery(''); input.current?.focus() }} className="px-2 text-neutral-400 hover:text-neutral-700">
          <X size={16} />
        </button>
      )}
      <kbd className="mr-2 hidden rounded border border-neutral-200 px-1.5 text-[10px] text-neutral-400 lg:block">/</kbd>
      <button type="submit" aria-label="Buscar" className="grid h-full w-12 place-items-center border-l border-neutral-200 text-neutral-500 hover:text-neutral-800">
        <Search size={18} />
      </button>

      {open && items.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md bg-surface shadow-xl ring-1 ring-neutral-200">
          {showingRecent && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1 text-xs text-neutral-500">
              <span>Búsquedas recientes</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearSearches} className="text-primary hover:underline">
                Borrar
              </button>
            </div>
          )}
          <ul id={listId} role="listbox" aria-label={showingRecent ? 'Búsquedas recientes' : 'Sugerencias'}>
            {items.map((item, i) => (
              <li
                key={item}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(item)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${i === active ? 'bg-neutral-100' : ''}`}
              >
                {showingRecent ? <Clock size={14} className="text-neutral-400" /> : <Search size={14} className="text-neutral-400" />}
                <span className="truncate">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}
