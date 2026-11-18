import { CartItem } from './CartItem.js'
import type { DiscountRule } from './Discount.js'
import type { Product } from './Product.js'

export class Cart {
  private items: Map<string, CartItem> = new Map()
  private discount: DiscountRule | null = null
  private taxRate: number = 0 // e.g., 0.11 for 11%

  constructor(taxRate: number = 0) {
    if (taxRate < 0) throw new Error('Tax rate cannot be negative.')
    this.taxRate = taxRate
  }

  addItem(
    product: Product,
    quantity: number = 1,
    availableStock?: number,
  ): void {
    const existingItem = this.items.get(product.id)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0
    const totalRequested = currentQuantityInCart + quantity

    // Validasi langsung jika informasi stok diberikan
    if (availableStock !== undefined && totalRequested > availableStock)
      throw new Error(
        `Cannot add ${quantity}x ${product.name}. Only ${availableStock} left in stock (already have ${currentQuantityInCart} in cart).`,
      )

    if (existingItem) {
      existingItem.increaseQuantity(quantity)
    } else {
      const newItem = new CartItem(product, quantity)
      this.items.set(product.id, newItem)
    }
  }

  decreaseItem(productId: string, quantity: number = 1): void {
    const existingItem = this.items.get(productId)
    if (!existingItem) return

    if (existingItem.quantity - quantity <= 0) {
      this.items.delete(productId)
    } else {
      existingItem.decreaseQuantity(quantity)
    }
  }

  removeItem(productId: string): void {
    this.items.delete(productId)
  }

  get totalAmount(): number {
    let total = 0
    for (const item of this.items.values()) {
      total += item.subTotal
    }
    return total
  }

  get isEmpty(): boolean {
    return this.items.size === 0
  }

  getAllItems(): CartItem[] {
    return Array.from(this.items.values())
  }

  applyDiscount(discount: DiscountRule): void {
    this.discount = discount
  }

  removeDiscount(): void {
    this.discount = null
  }

  get subtotal(): number {
    let total = 0
    for (const item of this.items.values()) {
      total += item.subTotal
    }
    return total
  }

  get discountAmount(): number {
    if (!this.discount) return 0
    const rawDiscount = this.discount.calculateDiscount(this.subtotal)
    return Math.round(rawDiscount) // Bulatkan ke Rupiah terdekat
  }

  get taxAmount(): number {
    const taxableAmount = this.subtotal - this.discountAmount
    return Math.round(taxableAmount * this.taxRate) // Bulatkan ke Rupiah terdekat
  }

  get grandTotal(): number {
    const taxableAmount = this.subtotal - this.discountAmount
    return taxableAmount + this.taxAmount
  }

  clear(): void {
    this.items.clear()
    this.discount = null // Reset discount for the next customer
  }
}
