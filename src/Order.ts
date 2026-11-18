import type { OrderItem } from './OrderItem.js'

// Completed Transaction Record (Receipt)
export class Order {
  public readonly id: string
  public readonly createdAt: Date
  public readonly items: readonly OrderItem[]
  public readonly subtotal: number
  public readonly discountAmount: number
  public readonly taxAmount: number
  public readonly grandTotal: number
  public readonly amountPaid: number
  public readonly change: number

  constructor(
    id: string,
    items: OrderItem[],
    subtotal: number,
    discountAmount: number,
    taxAmount: number,
    grandTotal: number,
    amountPaid: number,
  ) {
    if (amountPaid < grandTotal) {
      throw new Error('Insufficient payment amount.')
    }

    this.id = id
    this.createdAt = new Date()
    this.items = Object.freeze([...items]) // Freeze array so receipt cannot be altered
    this.subtotal = subtotal
    this.discountAmount = discountAmount
    this.taxAmount = taxAmount
    this.grandTotal = grandTotal
    this.amountPaid = amountPaid
    this.change = amountPaid - grandTotal
  }
}
