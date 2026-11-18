import { CashierSession } from './CashierSession.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'
import { ProductCatalog } from './ProductCatalog.js'
import { RefundService } from './RefundService.js'

// --- 1. SETUP SISTEM LENGKAP ---
const catalog = new ProductCatalog()
const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)
const cashier = new CashierSession(catalog, inventory, checkoutService, 0) // Pajak 0% agar angka bulat mudah dicek
const refundService = new RefundService(orderRepo, inventory, catalog)

// --- 2. DAFTAR MENU & ISI STOK AWAL ---
const shirt = new Product('P01', 'SKU-001', 'Cotton T-Shirt', 100000)
const mug = new Product('P02', 'SKU-002', 'Ceramic Mug', 50000)

catalog.register(shirt)
catalog.register(mug)

inventory.restock(shirt, 10) // Stok awal kaos: 10
inventory.restock(mug, 10) // Stok awal mug: 10

// --- 3. PELANGGAN MELAKUKAN PEMBELIAN ---
// Beli 3 Kaos (300.000) dan 2 Mug (100.000) -> Total = 400.000
cashier.selectProduct('P01', 3)
cashier.selectProduct('P02', 2)

const receipt = cashier.checkout(400000)
console.log('Struk Asli Terbit:', receipt.id)
console.log(
  'Stok Kaos setelah beli (Ekspektasi 7):',
  inventory.getItem('P01')?.quantity,
)
console.log(
  'Stok Mug setelah beli (Ekspektasi 8):',
  inventory.getItem('P02')?.quantity,
)

// =========================================================
// TEST 1: Retur Normal / Layak Jual (Stok Bertambah Kembali)
// =========================================================
console.log('\n--- TEST 1: RETUR LAYAK JUAL (1x KAOS) ---')
// Pelanggan salah ukuran, retur 1 kaos dalam kondisi baru (restockable: true)
const refund1 = refundService.processRefund(
  receipt.id,
  [{ productId: 'P01', quantity: 1, restockable: true }],
  'Wrong size',
)

console.log('Refund ID:', refund1.id)
console.log('Uang Dikembalikan (Ekspektasi 100000):', refund1.totalRefundAmount)
console.log(
  'Stok Kaos sekarang (Ekspektasi 8):',
  inventory.getItem('P01')?.quantity,
)

// =========================================================
// TEST 2: Retur Barang Cacat/Rusak (Stok TIDAK Bertambah)
// =========================================================
console.log('\n--- TEST 2: RETUR BARANG RUSAK (1x MUG) ---')
// Pelanggan retur 1 mug karena retak (restockable: false)
const refund2 = refundService.processRefund(
  receipt.id,
  [{ productId: 'P02', quantity: 1, restockable: false }],
  'Cracked handle',
)

console.log('Uang Dikembalikan (Ekspektasi 50000):', refund2.totalRefundAmount)
console.log(
  'Stok Mug tetap (Ekspektasi 8):',
  inventory.getItem('P02')?.quantity,
)

// =========================================================
// TEST 3: Proteksi Retur Berlebih (Melebihi Sisa Kuantitas Struk)
// =========================================================
console.log('\n--- TEST 3: UJI PROTEKSI RETUR MELEBIHI BATAS ---')
// Awalnya beli 3 Kaos, sudah diretur 1 di Test 1 -> Sisa maksimal retur tinggal 2.
// Sekarang coba retur 3 Kaos sekaligus -> Harus ditolak!
try {
  refundService.processRefund(
    receipt.id,
    [{ productId: 'P01', quantity: 3, restockable: true }],
    'Trying to over-refund',
  )
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 4: Proteksi Barang yang Tidak Ada di Struk
// =========================================================
console.log('\n--- TEST 4: BARANG TIDAK ADA DI STRUK ---')
try {
  refundService.processRefund(
    receipt.id,
    [{ productId: 'P99', quantity: 1 }],
    'Fake item',
  )
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// RINGKASAN RIWAYAT REFUND
// =========================================================
console.log(
  '\nTotal Catatan Refund Tersimpan:',
  refundService.getAllRefunds().length,
) // Ekspektasi: 2
