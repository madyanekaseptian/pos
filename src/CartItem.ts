import type { Product } from './Product.js'

export class CartItem {
  constructor(
    public readonly product: Product,
    private _quantity = 1,
  ) {
    if (_quantity < 1) throw new Error('Cart item quantity must be at least 1.')
  }

  get quantity(): number {
    return this._quantity
  }

  get subTotal(): number {
    return this.product.price * this._quantity
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
