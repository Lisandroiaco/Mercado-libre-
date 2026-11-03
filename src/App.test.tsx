import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { StoreProvider } from './context/StoreContext'
import { products } from './data/products'

function renderAt(path: string) {
  return render(
    <StoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </StoreProvider>,
  )
}

const stored = (key: string) => JSON.parse(localStorage.getItem(`mercadito:${key}`) ?? 'null')

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = () => {}
  Element.prototype.scrollBy = () => {}
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true })
})

describe('App', () => {
  it('searches from the header and remembers the search', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.type(screen.getByRole('combobox', { name: 'Buscar' }), 'jbl{enter}')
    expect(await screen.findByRole('heading', { level: 1, name: 'jbl' })).toBeInTheDocument()
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
    expect(stored('searches')).toEqual(['jbl'])
  })

  it('autocompletes as you type', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.type(screen.getByRole('combobox', { name: 'Buscar' }), 'xiao')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('xiaomi')
    await user.click(options[0])
    expect(await screen.findByRole('heading', { level: 1, name: 'xiaomi' })).toBeInTheDocument()
  })

  it('suggests a correction when nothing matches', async () => {
    renderAt('/buscar?q=samsnug')
    expect(screen.getByRole('link', { name: 'samsung' })).toBeInTheDocument()
  })

  it('filters by brand from the sidebar', async () => {
    const user = userEvent.setup()
    renderAt('/buscar?category=celulares')
    await user.click(screen.getByRole('button', { name: /^Samsung \(\d+\)$/ }))
    expect(screen.getByRole('button', { name: /^Samsung$/ })).toBeInTheDocument() // filter chip
    const expected = products.filter((p) => p.category === 'celulares' && p.brand === 'Samsung')
    expect(screen.getByText(`${expected.length} resultados`)).toBeInTheDocument()
    expect(screen.getAllByText('Por SAMSUNG TIENDA OFICIAL')).toHaveLength(expected.length)
  })

  it('buys a product with a variant, a coupon and a card', async () => {
    const user = userEvent.setup()
    renderAt('/producto/MLA-1001')
    await user.click(screen.getByRole('button', { name: 'Azul hielo' }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    const drawer = screen.getByRole('dialog', { name: 'Carrito' })
    expect(within(drawer).getByText('Azul hielo')).toBeInTheDocument()
    await user.click(within(drawer).getByRole('link', { name: 'Ver carrito' }))

    await user.type(screen.getByLabelText('Código de cupón'), 'mercadito10{enter}')
    expect(screen.getByText('Cupón MERCADITO10')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuar compra' }))

    await user.type(screen.getByLabelText('Nombre y apellido'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Calle y número'), 'Av. Corrientes 1234')
    await user.type(screen.getByLabelText('Localidad'), 'CABA')
    await user.type(screen.getByLabelText('Código postal'), '1043')
    await user.type(screen.getByLabelText('Teléfono de contacto'), '11 5555-5555')
    await user.click(screen.getByRole('radio', { name: /Envío express/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Revisá el número de tarjeta.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Número de tarjeta'), '4509953566233704')
    await user.type(screen.getByLabelText('Nombre del titular'), 'ADA LOVELACE')
    await user.type(screen.getByLabelText('Vencimiento'), '1230')
    await user.type(screen.getByLabelText('Código de seguridad'), '123')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText(/Tarjeta visa terminada en 3704/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(screen.getByRole('heading', { name: /tu compra está confirmada/i })).toBeInTheDocument()
    const [order] = stored('orders')
    expect(order).toMatchObject({ delivery: 'express', coupon: 'MERCADITO10', payment: 'card' })
    expect(order.lines[0]).toMatchObject({ productId: 'MLA-1001', variant: 'Azul hielo' })
    expect(stored('cart')).toEqual([])
  })

  it('saves items for later and moves them back', async () => {
    const user = userEvent.setup()
    localStorage.setItem('mercadito:cart', JSON.stringify([{ productId: 'MLA-2005', quantity: 1 }]))
    renderAt('/carrito')
    await user.click(screen.getByRole('button', { name: 'Guardar para después' }))
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mover al carrito' }))
    expect(screen.getByRole('heading', { name: 'Carrito (1)' })).toBeInTheDocument()
  })

  it('publishes a product that shows up in search', async () => {
    const user = userEvent.setup()
    renderAt('/vender')
    await user.type(screen.getByLabelText('Título'), 'Guitarra criolla de estudio')
    await user.type(screen.getByLabelText('Marca'), 'Fonseca')
    await user.type(screen.getByLabelText('Precio ($)'), '85000')
    await user.type(screen.getByLabelText('Descripción'), 'Guitarra en excelente estado, con funda.')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Guitarra criolla de estudio' })).toBeInTheDocument()
    expect(stored('listings')).toHaveLength(1)
  })

  it('compares products side by side', async () => {
    localStorage.setItem('mercadito:compare', JSON.stringify(['MLA-1001', 'MLA-1003']))
    renderAt('/comparar')
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText(/el más barato/)).toBeInTheDocument()
  })

  it('logs in with the demo account', async () => {
    const user = userEvent.setup()
    renderAt('/ingresar')
    await user.click(screen.getByRole('button', { name: 'Probar con una cuenta demo' }))
    expect(stored('user')).toEqual({ name: 'Ada Lovelace', email: 'ada@ejemplo.com' })
  })

  it('writes a review', async () => {
    const user = userEvent.setup()
    renderAt('/producto/MLA-2005')
    await user.click(screen.getByRole('button', { name: 'Escribir una opinión' }))
    await user.click(screen.getByRole('radio', { name: '5 estrellas' }))
    await user.type(screen.getByLabelText('Tu opinión'), 'Anda bárbaro, súper liviano.')
    await user.click(screen.getByRole('button', { name: /Publicar opinión/ }))
    expect(screen.getByText('Anda bárbaro, súper liviano.')).toBeInTheDocument()
  })

  it('toggles favorites', async () => {
    const user = userEvent.setup()
    renderAt('/producto/MLA-1001')
    const main = screen.getByRole('main')
    await user.click(within(main).getAllByRole('button', { name: 'Agregar a favoritos' })[0])
    expect(stored('favorites')).toEqual(['MLA-1001'])
  })

  it('shows 404 for unknown products', () => {
    renderAt('/producto/nada')
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
