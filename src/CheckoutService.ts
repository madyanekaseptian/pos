import type { Cart } from './Cart.js'
import type { Inventory } from './Inventory.js'
import { Order } from './Order.js'
import { OrderItem } from './OrderItem.js'
import type { OrderRepository } from './OrderRepository.js'
import type { ShiftSession } from './ShiftSession.js'

// Orchestrator for the Checkout Process
export class CheckoutService {
  constructor(
    private readonly inventory: Inventory,
    private readonly orderRepository: OrderRepository,
    private shiftSession: ShiftSession,
  ) {}

  processCheckout(cart: Cart, amountPaid: number): Order {
    this.shiftSession.ensureActiveShift()

    if (cart.isEmpty) {
      throw new Error('Cannot checkout an empty cart.')
    }

    const grandTotal = cart.grandTotal
    if (amountPaid < grandTotal) {
      throw new Error(
        `Insufficient payment. Grand total is ${grandTotal}, but paid ${amountPaid}.`,
      )
    }

    // Deduct stock from inventory (throws error if any stock is insufficient)
    const stockDeductions = cart.getAllItems().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))
    this.inventory.fulfillOrder(stockDeductions)

    // Create immutable OrderItems snapshot
    const orderItems = cart
      .getAllItems()
      .map(
        (item) =>
          new OrderItem(
            item.product.id,
            item.product.name,
            item.product.price,
            item.quantity,
            item.discountAmount,
          ),
      )

    // Generate Order receipt
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const order = new Order(
      orderId,
      orderItems,
      cart.subtotal,
      cart.discountAmount,
      cart.taxAmount,
      grandTotal,
      amountPaid,
    )

    // Save completed transaction to history
    this.shiftSession.drawer.recordSale(grandTotal, orderId)
    this.orderRepository.save(order)

    cart.clear()

    return order
  }
}
