import type { Product } from './Product.js'

export class InventoryItem {
  constructor(
    public readonly product: Product,
    private _quantity: number = 0,
  ) {
    if (_quantity < 0) throw new Error('Initial quantity cannot be negative.')
  }

  get quantity(): number {
    return this._quantity
  }

  addStock(amount: number): void {
    if (amount <= 0) throw new Error('Amount to add must be greater than 0.')
    this._quantity += amount
  }

  deductStock(amount: number): void {
    if (amount <= 0) throw new Error('Amount to deduct must be greater than 0.')
    if (this._quantity < amount)
      throw new Error(`Insufficient stock for ${this.product.name}.`)
    this._quantity -= amount
  }
}
