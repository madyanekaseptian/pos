import type { OrderItem } from './OrderItem.js'

// Completed Transaction Record (Receipt)
export class Order {
  public readonly id: string
  public readonly createdAt: Date
  public readonly items: readonly OrderItem[]
  public readonly totalAmount: number
  public readonly amountPaid: number
  public readonly change: number

  constructor(
    id: string,
    items: OrderItem[],
    totalAmount: number,
    amountPaid: number,
  ) {
    if (amountPaid < totalAmount) {
      throw new Error('Insufficient payment amount.')
    }

    this.id = id
    this.createdAt = new Date()
    this.items = Object.freeze([...items]) // Freeze array so receipt cannot be altered
    this.totalAmount = totalAmount
    this.amountPaid = amountPaid
    this.change = amountPaid - totalAmount
  }
}
