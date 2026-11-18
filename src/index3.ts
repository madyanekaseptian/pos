import { Cart } from './Cart.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'

const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)

const coffee = new Product('P01', 'Iced Latte', 25000)
const pastry = new Product('P02', 'Croissant', 20000)
inventory.restock(coffee, 20)
inventory.restock(pastry, 20)

// Transaksi Pelanggan 1
const cart = new Cart()
cart.addItem(coffee, 2) // 50.000
checkoutService.processCheckout(cart, 50000)

// Transaksi Pelanggan 2
cart.addItem(pastry, 3) // 60.000
checkoutService.processCheckout(cart, 100000)

// Cek Laporan Riwayat Transaksi
console.log('Jumlah Transaksi:', orderRepo.getAllOrders().length) // Output: 2
console.log('Total Omzet Hari Ini:', orderRepo.getTotalRevenue()) // Output: 110000
