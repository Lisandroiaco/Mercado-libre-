import { CreditCard, ShieldCheck, Truck } from 'lucide-react'

const perks = [
  { icon: CreditCard, title: 'Pagá con tarjeta o en efectivo', text: 'Con Mercadito tenés cuotas sin interés en productos seleccionados.' },
  { icon: Truck, title: 'Envío gratis desde $ 30.000', text: 'Solo por estar registrado tenés envíos gratis en miles de productos.' },
  { icon: ShieldCheck, title: 'Seguridad, de principio a fin', text: '¿No te gusta? ¡Devolvelo! No hay nada que no puedas hacer.' },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="mt-16">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-center md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon size={44} strokeWidth={1.25} className="text-primary" />
              <h3 className="text-lg text-neutral-700">{title}</h3>
              <p className="max-w-xs text-sm text-neutral-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <p>Proyecto de portfolio hecho con React, TypeScript y Tailwind CSS. No es un sitio comercial real.</p>
          <p>© {YEAR} Mercadito · Inspirado en los grandes marketplaces de Latinoamérica.</p>
        </div>
      </div>
    </footer>
  )
}
