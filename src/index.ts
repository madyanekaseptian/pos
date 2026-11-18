import { CashierSession } from './CashierSession.js'
import { CheckoutService } from './CheckoutService.js'
import { FixedAmountDiscount, PercentageDiscount } from './Discount.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'

// --- SETUP SISTEM TOKO (PAJAK PPN 11%) ---
const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)
const cashier = new CashierSession(inventory, checkoutService, 0.11)

const coffee = new Product('P01', 'Iced Latte', 25000)
const pastry = new Product('P02', 'Croissant', 30000)
inventory.restock(coffee, 10)
inventory.restock(pastry, 10)

// =========================================================
// SKENARIO 1: Diskon Khusus Item + Diskon Total Keranjang
// =========================================================
console.log('--- SKENARIO 1: GABUNGAN DISKON ITEM & KERANJANG ---')

// Kasir scan 2 Croissant (60.000) dan 2 Iced Latte (50.000)
cashier.scanProduct(pastry, 2)
cashier.scanProduct(coffee, 2)

// Promo Sore: Khusus Croissant diskon 50% (potongan 30.000)
const clearancePromo = new PercentageDiscount('Evening Clearance 50%', 50)
cashier.applyItemDiscount('P02', clearancePromo)

// Cek rincian per item di keranjang
for (const item of cashier.getCartItems()) {
  console.log(
    `- ${item.product.name} (${item.quantity}x): Kotor Rp${item.grossSubtotal} | Diskon Item Rp${item.discountAmount} | Bersih Rp${item.subtotal}`,
  )
}

// Tambah Voucher Toko Rp10.000 untuk total belanja
// Subtotal saat ini = 30.000 (Croissant) + 50.000 (Latte) = 80.000
const storeVoucher = new FixedAmountDiscount('Voucher Toko 10rb', 10000)
cashier.applyDiscount(storeVoucher)

// Cek tagihan akhir:
// Subtotal: 80.000
// Diskon Keranjang: 10.000 -> Harga Kena Pajak: 70.000
// Pajak 11% dari 70.000: 7.700
// Grand Total: 77.700
console.log('Ringkasan Tagihan:', cashier.getBillSummary())

// =========================================================
// SKENARIO 2: Kasir Salah Input Diskon Item & Membatalkannya
// =========================================================
console.log('\n--- SKENARIO 2: PEMBATALAN DISKON ITEM ---')
// Misal promo Croissant dibatalkan (pastikan method removeItemDiscount sudah ada di CashierSession)
cashier.removeItemDiscount('P02')

// Subtotal kembali menjadi 60.000 + 50.000 = 110.000
// Diskon Keranjang tetap 10.000 -> Harga Kena Pajak: 100.000
// Pajak 11% dari 100.000: 11.000 -> Grand Total: 111.000
console.log('Tagihan Setelah Diskon Item Dihapus:', cashier.getBillSummary())

// =========================================================
// SKENARIO 3: Checkout & Verifikasi Struk
// =========================================================
console.log('\n--- SKENARIO 3: CHECKOUT & CETAK STRUK ---')
const receipt = cashier.checkout(150000)
console.log('Order ID:', receipt.id)
console.log('Grand Total:', receipt.grandTotal) // 111000
console.log('Kembalian:', receipt.change) // 39000
console.log('Detail Item di Struk:', receipt.items)
