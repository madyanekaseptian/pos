import type { RefundItem } from './RefundItem.js'

export class Refund {
  public readonly id: string
  public readonly originalOrderId: string
  public readonly createdAt: Date
  public readonly items: readonly RefundItem[]
  public readonly totalRefundAmount: number
  public readonly reason: string

  constructor(
    id: string,
    originalOrderId: string,
    items: RefundItem[],
    reason: string,
  ) {
    this.id = id
    this.originalOrderId = originalOrderId
    this.createdAt = new Date()
    this.items = Object.freeze([...items])
    this.reason = reason
    this.totalRefundAmount = items.reduce(
      (sum, item) => sum + item.refundSubtotal,
      0,
    )
  }
}
