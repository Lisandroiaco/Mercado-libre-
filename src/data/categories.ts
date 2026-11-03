import type { Category, CategoryId } from '../types'

export const categories: Category[] = [
  { id: 'celulares', name: 'Celulares y Teléfonos', hue: 215 },
  { id: 'computacion', name: 'Computación', hue: 255 },
  { id: 'electronica', name: 'Electrónica, Audio y Video', hue: 280 },
  { id: 'hogar', name: 'Hogar y Muebles', hue: 30 },
  { id: 'deportes', name: 'Deportes y Fitness', hue: 140 },
  { id: 'moda', name: 'Ropa y Accesorios', hue: 330 },
  { id: 'juguetes', name: 'Juegos y Juguetes', hue: 0 },
  { id: 'herramientas', name: 'Herramientas', hue: 45 },
  { id: 'belleza', name: 'Belleza y Cuidado Personal', hue: 300 },
  { id: 'mascotas', name: 'Animales y Mascotas', hue: 175 },
]

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>
