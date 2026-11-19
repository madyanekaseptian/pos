import type { Order } from './Order.js'

// Repository for Completed Transactions
export class OrderRepository {
  private orders: Map<string, Order> = new Map()

  save(order: Order): void {
    this.orders.set(order.id, order)
  }

  findById(orderId: string): Order | undefined {
    return this.orders.get(orderId)
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values())
  }

  getTotalRevenue(): number {
    let total = 0
    for (const order of this.orders.values()) {
      total += order.grandTotal
    }
    return total
  }
}
