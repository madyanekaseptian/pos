import { Cart } from './Cart.js'
import type { CartItem } from './CartItem.js'
import type { CheckoutService } from './CheckoutService.js'
import type { DiscountRule } from './Discount.js'
import type { Inventory } from './Inventory.js'
import type { Order } from './Order.js'
import type { Product } from './Product.js'

export class CashierSession {
  private cart: Cart = new Cart()

  constructor(
    private readonly inventory: Inventory,
    private readonly checkoutService: CheckoutService,
    defaultTaxRate: number = 0,
  ) {
    // Cart diinisialisasi otomatis dengan tarif pajak toko
    this.cart = new Cart(defaultTaxRate)
  }

  // --- OPERASI BARANG ---
  scanProduct(product: Product, quantity: number): void {
    const inventoryItem = this.inventory.getItem(product.id)
    const availableStock = inventoryItem ? inventoryItem.quantity : 0

    this.cart.addItem(product, quantity, availableStock)
  }

  decreaseProduct(productId: string, quantity: number): void {
    this.cart.decreaseItem(productId, quantity)
  }

  removeProduct(productId: string): void {
    this.cart.removeItem(productId)
  }

  // --- OPERASI DISKON ---
  applyDiscount(discount: DiscountRule): void {
    this.cart.applyDiscount(discount)
  }

  removeDiscount(): void {
    this.cart.removeDiscount()
  }

  // --- INFORMASI LAYAR KASIR ---
  getCartItems(): CartItem[] {
    return this.cart.getAllItems()
  }

  getBillSummary(): Record<string, number> {
    return {
      subtotal: this.cart.subtotal,
      discount: this.cart.discountAmount,
      tax: this.cart.taxAmount,
      grandTotal: this.cart.grandTotal,
    }
  }

  checkout(amountPaid: number): Order {
    return this.checkoutService.processCheckout(this.cart, amountPaid)
  }
}
