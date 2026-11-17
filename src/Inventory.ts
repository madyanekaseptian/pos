import { InventoryItem } from './InventoryItem.js'
import type { Product } from './Product.js'

export class Inventory {
  private items: Map<string, InventoryItem> = new Map()

  restock(product: Product, quantity: number) {
    const existingItem = this.items.get(product.id)

    if (existingItem) {
      existingItem.addStock(quantity)
    } else {
      const newItem = new InventoryItem(product, quantity)
      this.items.set(product.id, newItem)
    }
  }

  getItem(productId: string): InventoryItem | undefined {
    return this.items.get(productId)
  }

  hasStock(productId: string, requiredQuantity: number): boolean {
    const item = this.items.get(productId)
    return item ? item.quantity >= requiredQuantity : false
  }

  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values())
  }

  removeStock(productId: string, quantity: number): void {
    const item = this.items.get(productId)
    if (!item)
      throw new Error('Product with ID ${productId} not found in inventory.')
    item.deductStock(quantity)
  }

  fulfillOrder(orderItems: { productId: string; quantity: number }[]): void {
    for (const order of orderItems) {
      if (!this.hasStock(order.productId, order.quantity)) {
        throw new Error(`Insufficient stock for product ID: ${order.productId}`)
      }
    }

    for (const order of orderItems) {
      const item = this.items.get(order.productId)!
      item.deductStock(order.quantity)
    }
  }
}
