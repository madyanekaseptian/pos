import type { DiscountRule } from './Discount.js'
import type { Product } from './Product.js'

export class CartItem {
  private discount: DiscountRule | null = null

  constructor(
    public readonly product: Product,
    private _quantity = 1,
  ) {
    if (_quantity < 1) throw new Error('Cart item quantity must be at least 1.')
  }

  get quantity(): number {
    return this._quantity
  }

  // Harga kotor sebelum diskon item
  get grossSubtotal(): number {
    return this.product.price * this._quantity
  }

  // Nominal potongan diskon khusus item ini
  get discountAmount(): number {
    if (!this.discount) return 0
    return Math.round(this.discount.calculateDiscount(this.grossSubtotal))
  }

  // Harga bersih baris ini setelah diskon item
  get subtotal(): number {
    return this.grossSubtotal - this.discountAmount
  }

  applyDiscount(discount: DiscountRule): void {
    this.discount = discount
  }

  removeDiscount(): void {
    this.discount = null
  }

  increaseQuantity(amount: number = 1): void {
    if (amount <= 0) throw new Error('Amount must be greater than 0.')
    this._quantity += amount
  }

  decreaseQuantity(amount: number = 1): void {
    if (amount <= 0) throw new Error('Amount must be greater than 0.')
    if (this._quantity - amount < 1)
      throw new Error(
        'Quantity cannot be less than 1. Remove item from cart instead.',
      )
    this._quantity -= amount
  }
}
