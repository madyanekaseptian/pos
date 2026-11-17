import type { Cart } from './Cart.js'
import type { Inventory } from './Inventory.js'
import { Order } from './Order.js'
import { OrderItem } from './OrderItem.js'

// Orchestrator for the Checkout Process
export class CheckoutService {
  constructor(private readonly inventory: Inventory) {}

  processCheckout(cart: Cart, amountPaid: number): Order {
    if (cart.isEmpty) {
      throw new Error('Cannot checkout an empty cart.')
    }

    const totalAmount = cart.totalAmount
    if (amountPaid < totalAmount) {
      throw new Error(
        `Insufficient payment. Total is ${totalAmount}, but paid ${amountPaid}.`,
      )
    }

    // Step 1: Deduct stock from inventory (throws error if any stock is insufficient)
    const stockDeductions = cart.getAllItems().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))
    this.inventory.fulfillOrder(stockDeductions)

    // Step 2: Create immutable OrderItems snapshot
    const orderItems = cart
      .getAllItems()
      .map(
        (item) =>
          new OrderItem(
            item.product.id,
            item.product.name,
            item.product.price,
            item.quantity,
          ),
      )

    // Step 3: Generate Order receipt
    const orderId = `ORD-${Date.now()}`
    const order = new Order(orderId, orderItems, totalAmount, amountPaid)

    // Step 4: Clear active cart for the next customer
    cart.clear()

    return order
  }
}
