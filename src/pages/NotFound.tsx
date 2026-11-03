import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl font-bold text-neutral-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-700">Parece que esta página no existe</h1>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Ir a la página principal
      </Link>
    </div>
  )
}
