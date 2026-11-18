import { CashierSession } from './CashierSession.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'

const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)
const cashier = new CashierSession(inventory, checkoutService)

const mouse = new Product('P01', 'Logitech M650', 500000)
inventory.restock(mouse, 3)

// Kasir scan 2 mouse ->  Berhasil
cashier.scanProduct(mouse, 2)

// Kasir menekan tombol "+" 2 kali lagi (total diminta jadi 4, padahal stok 3)
try {
  cashier.scanProduct(mouse, 2)
} catch (error) {
  console.error((error as Error).message)
  // Output: Cannot add 2x Logitech M650. Only 3 left in stock (already have 2 in cart).
}

// Kasir menekan tombol "+" 1 kali saja (total jadi 3) -> Berhasil
cashier.scanProduct(mouse, 1)
console.log('Total keranjang:', cashier.getCartTotal()) // Output: 1500000
