import { CashierSession } from './CashierSession.js'
import { CheckoutService } from './CheckoutService.js'
import { PercentageDiscount } from './Discount.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'

// 1. Setup Sistem Toko (Pajak PPN 11%)
const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)
const cashier = new CashierSession(inventory, checkoutService, 0.11)

// 2. Isi Stok Gudang
const coffee = new Product('P01', 'Iced Latte', 25000)
const cake = new Product('P02', 'Cheesecake', 45000)
inventory.restock(coffee, 10)
inventory.restock(cake, 5)

// 3. Kasir Melayani Pelanggan
cashier.scanProduct(coffee, 2) // 50.000
cashier.scanProduct(cake, 1) // 45.000

// Pelanggan menyerahkan voucher diskon 10%
const memberPromo = new PercentageDiscount('Member 10%', 10)
cashier.applyDiscount(memberPromo)

// Tampilkan ringkasan di layar kasir sebelum bayar
console.log('Ringkasan Tagihan:', cashier.getBillSummary())
// Output: { subtotal: 95000, discount: 9500, tax: 9405, grandTotal: 94905 }

// 4. Pelanggan Membayar Rp100.000
const receipt = cashier.checkout(100000)
console.log(`Transaksi ${receipt.id} selesai! Kembalian: Rp${receipt.change}`)
