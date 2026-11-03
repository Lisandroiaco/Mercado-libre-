import type { CartLine } from './cart'
import type { Order } from '../types'

export const orderStages = ['Compra confirmada', 'Preparando el paquete', 'En camino', 'Entregado'] as const

/**
 * The demo has no backend, so an order "advances" with time: each stage takes a few
 * minutes after the purchase. Returns the index into `orderStages`.
 */
export function orderStage(order: Order, now = new Date()): number {
  const minutes = (now.getTime() - new Date(order.date).getTime()) / 60000
  if (minutes < 2) return 0
  if (minutes < 5) return 1
  if (minutes < 10) return 2
  return 3
}

const dateFmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
export function formatOrderDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

/** Snapshot of the cart at purchase time, so later price changes don't alter past orders. */
export function buildOrder(lines: CartLine[], details: Omit<Order, 'id' | 'date' | 'lines'>, now = new Date()): Order {
  return {
    id: String(now.getTime()).slice(-8),
    date: now.toISOString(),
    lines: lines.map((l) => ({ productId: l.product.id, title: l.product.title, price: l.product.price, quantity: l.quantity, variant: l.variant })),
    ...details,
  }
}
