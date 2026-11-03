import { Store } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/store'

export default function Login() {
  const { login, notify } = useStore()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const register = sp.get('modo') === 'registro'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Ingresá un e-mail válido.')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (register && name.trim().length < 2) return setError('Ingresá tu nombre.')
    const displayName = register ? name.trim() : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    login({ name: displayName, email })
    notify(`¡Hola, ${displayName.split(' ')[0]}!`)
    navigate(sp.get('volver') ?? '/')
  }

  const demo = () => {
    login({ name: 'Ada Lovelace', email: 'ada@ejemplo.com' })
    notify('Entraste con la cuenta de prueba')
    navigate(sp.get('volver') ?? '/')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="space-y-6 rounded-md bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-brand text-ink"><Store /></span>
          <h1 className="text-2xl font-semibold">{register ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}</h1>
          <p className="text-sm text-neutral-500">Es una demo: los datos quedan solo en tu navegador.</p>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4">
          {register && (
            <div className="text-sm">
              <label htmlFor="login-name" className="text-neutral-600">Nombre y apellido</label>
              <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1 w-full rounded-md border border-neutral-300 bg-surface px-3 py-2.5 outline-none focus:border-primary" />
            </div>
          )}
          <div className="text-sm">
            <label htmlFor="login-email" className="text-neutral-600">E-mail</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-md border border-neutral-300 bg-surface px-3 py-2.5 outline-none focus:border-primary" />
          </div>
          <div className="text-sm">
            <label htmlFor="login-password" className="text-neutral-600">Contraseña</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} className="mt-1 w-full rounded-md border border-neutral-300 bg-surface px-3 py-2.5 outline-none focus:border-primary" />
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full rounded-md bg-primary py-3 font-semibold text-white hover:bg-primary-dark">{register ? 'Crear cuenta' : 'Ingresar'}</button>
        </form>
        <button type="button" onClick={demo} className="w-full rounded-md bg-primary/10 py-3 font-semibold text-primary hover:bg-primary/20">Probar con una cuenta demo</button>
        <p className="text-center text-sm">
          {register ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
          <Link to={register ? '/ingresar' : '/ingresar?modo=registro'} className="text-primary hover:underline">
            {register ? 'Ingresá' : 'Creá una'}
          </Link>
        </p>
      </div>
    </div>
  )
}
