import { Dumbbell, Gamepad2, Laptop, Shirt, Smartphone, Sofa, Tv, Wrench, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '../types'

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  celulares: Smartphone,
  computacion: Laptop,
  electronica: Tv,
  hogar: Sofa,
  deportes: Dumbbell,
  moda: Shirt,
  juguetes: Gamepad2,
  herramientas: Wrench,
}
