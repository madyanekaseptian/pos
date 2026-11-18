/**
  UJI SKENARIO:
  • Kasus 1 (Normal dengan Persentase & Pajak): Memastikan urutan Subtotal -> Diskon % -> Pajak menghasilkan angka yang presisi.
  • Kasus 2 (Diskon Nominal Melebihi Subtotal): Memastikan jika pelanggan memakai voucher Rp50.000 untuk belanjaan Rp30.000, grandTotal berhenti di 0 (tidak menjadi minus).
  • Kasus 3 (Reset Otomatis Setelah Checkout): Memastikan setelah transaksi pertama selesai, promo diskon otomatis terhapus (null) sehingga tidak terbawa ke transaksi pelanggan berikutnya.
  • Kasus 4 (Validasi Input Tidak Valid): Memastikan sistem menolak diskon di atas 100% atau nilai negatif.
*/

import { Cart } from './Cart.js'
import { CheckoutService } from './CheckoutService.js'
import { FixedAmountDiscount, PercentageDiscount } from './Discount.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'

// --- SETUP SISTEM ---
const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)

const coffee = new Product('P01', 'Iced Latte', 25000)
const pastry = new Product('P02', 'Croissant', 50000)
inventory.restock(coffee, 20)
inventory.restock(pastry, 20)

// Inisialisasi Cart dengan Pajak 10% (0.1)
const cart = new Cart(0.1)

// ==========================================
// TEST 1: Perhitungan Normal (Diskon % + Pajak)
// ==========================================
cart.addItem(coffee, 2) // 50.000
cart.addItem(pastry, 1) // 50.000 -> Subtotal = 100.000

const promoOpening = new PercentageDiscount('Grand Opening 20%', 20)
cart.applyDiscount(promoOpening)

console.log('--- TEST 1: NORMAL CALCULATION ---')
console.log('Subtotal (Ekspektasi 100000):', cart.subtotal)
console.log('Diskon (Ekspektasi 20000):', cart.discountAmount)
console.log('Pajak 10% (Ekspektasi 8000):', cart.taxAmount)
console.log('Grand Total (Ekspektasi 88000):', cart.grandTotal)

const receipt1 = checkoutService.processCheckout(cart, 100000)
console.log('Kembalian Struk 1 (Ekspektasi 12000):', receipt1.change)

// ==========================================
// TEST 2: Reset Diskon & Edge Case Voucher Lebih Besar dari Belanja
// ==========================================
console.log('\n--- TEST 2: RESET & EDGE CASE VOUCHER ---')
// Pastikan diskon dari Pelanggan 1 sudah hilang
console.log('Diskon awal pelanggan 2 (Ekspektasi 0):', cart.discountAmount)

cart.addItem(coffee, 1) // Subtotal = 25.000
const bigVoucher = new FixedAmountDiscount('Voucher Sultan 50rb', 50000)
cart.applyDiscount(bigVoucher)

console.log('Subtotal (Ekspektasi 25000):', cart.subtotal)
console.log('Diskon Terpakai (Ekspektasi 25000):', cart.discountAmount)
console.log('Pajak (Ekspektasi 0):', cart.taxAmount)
console.log('Grand Total (Ekspektasi 0):', cart.grandTotal)

const receipt2 = checkoutService.processCheckout(cart, 0)
console.log('Struk 2 sukses dengan total:', receipt2.grandTotal)

// ==========================================
// TEST 3: Validasi Error Input
// ==========================================
console.log('\n--- TEST 3: ERROR VALIDATION ---')
try {
  new PercentageDiscount('Diskon Ngaco', 150)
} catch (e) {
  console.log('Error tertangkap sesuai harapan:', (e as Error).message)
}

// --- UJI KASUS FLOATING POINT ---
const coffeeSpecial = new Product('P03', 'Caramel Macchiato', 19900)
inventory.restock(coffeeSpecial, 10)

// Gunakan pajak PPN 11% (0.11)
const taxCart = new Cart(0.11)
taxCart.addItem(coffeeSpecial, 3) // Subtotal = 59.700

const promo = new PercentageDiscount('Promo 15%', 15)
taxCart.applyDiscount(promo)

console.log('\n--- TEST FLOATING POINT (PPN 11%) ---')
console.log('Subtotal:', taxCart.subtotal) // 59700
console.log('Diskon 15%:', taxCart.discountAmount) // 8955
console.log('Pajak 11%:', taxCart.taxAmount) // Output (Tanpa Round): 5581.950000000001
console.log('Grand Total:', taxCart.grandTotal) // Output (Tanpa Round): 56326.950000000004
