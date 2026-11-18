import { Cart } from './Cart.js'
import type { CartItem } from './CartItem.js'
import type { CheckoutService } from './CheckoutService.js'
import type { Inventory } from './Inventory.js'
import type { Order } from './Order.js'
import type { Product } from './Product.js'

export class CashierSession {
  private cart: Cart = new Cart()

  constructor(
    private readonly inventory: Inventory,
    private readonly checkoutService: CheckoutService,
  ) {}

  // Kasir menekan tombol "+" atau scan barcode
  scanProduct(product: Product, quantity: number): void {
    const inventoryItem = this.inventory.getItem(product.id)
    const availableStock = inventoryItem ? inventoryItem.quantity : 0

    // Panggil addItem dengan menyertakan batas stok saat ini
    this.cart.addItem(product, quantity, availableStock)
  }

  decreaseProduct(productId: string, quantity: number): void {
    this.cart.decreaseItem(productId, quantity)
  }

  getCartItems(): CartItem[] {
    return this.cart.getAllItems()
  }

  getCartTotal(): number {
    return this.cart.totalAmount
  }

  checkout(amountPaid: number): Order {
    return this.checkoutService.processCheckout(this.cart, amountPaid)
  }
}
