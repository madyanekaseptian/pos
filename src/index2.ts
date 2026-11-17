import { Cart } from './Cart.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { Product } from './Product.js'

const inventory = new Inventory()
const checkoutService = new CheckoutService(inventory)

const coffee = new Product('P01', 'Iced Latte', 25000)
inventory.restock(coffee, 10)

const cart = new Cart()
cart.addItem(coffee, 2) // Total: 50000

// Pelanggan membayar dengan uang Rp100.000
const receipt = checkoutService.processCheckout(cart, 100000)

// Uji bukti bahwa harga di struk aman meski harga master produk naik
coffee.price = 30000

console.log('Order ID:', receipt.id)
console.log('Total Belanja:', receipt.totalAmount) // Tetap 50000
console.log('Uang Dibayar:', receipt.amountPaid) // 100000
console.log('Kembalian:', receipt.change) // 50000
console.log('Sisa Stok Kopi:', inventory.getItem('P01')?.quantity) // 8
