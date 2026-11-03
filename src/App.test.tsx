import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { StoreProvider } from './context/StoreContext'

function renderAt(path: string) {
  return render(
    <StoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </StoreProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  window.scrollTo = () => {}
  Element.prototype.scrollBy = () => {}
})

describe('App', () => {
  it('searches from the header', async () => {
    renderAt('/')
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'jbl{enter}')
    expect(await screen.findByRole('heading', { level: 1, name: 'jbl' })).toBeInTheDocument()
    expect(screen.getByText('2 resultados')).toBeInTheDocument()
  })

  it('adds a product to the cart and completes checkout', async () => {
    const user = userEvent.setup()
    renderAt('/producto/MLA-2005')
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    await user.click(screen.getByRole('link', { name: 'Ir al carrito' }))

    expect(screen.getByRole('heading', { name: 'Carrito (1)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(screen.getByRole('heading', { name: 'Carrito (2)' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continuar compra' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Ingresá tu nombre y apellido.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre y apellido'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Calle y número'), 'Av. Corrientes 1234')
    await user.type(screen.getByLabelText('Localidad'), 'CABA')
    await user.type(screen.getByLabelText('Código postal'), '1043')
    await user.type(screen.getByLabelText('Teléfono de contacto'), '11 5555-5555')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))

    expect(screen.getByRole('heading', { name: /tu compra está confirmada/i })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('mercadito:cart')!)).toEqual([])
  })

  it('toggles favorites', async () => {
    const user = userEvent.setup()
    renderAt('/producto/MLA-1001')
    const main = screen.getByRole('main')
    await user.click(within(main).getAllByRole('button', { name: 'Agregar a favoritos' })[0])
    expect(JSON.parse(localStorage.getItem('mercadito:favorites')!)).toEqual(['MLA-1001'])
  })

  it('shows 404 for unknown products', () => {
    renderAt('/producto/nada')
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
