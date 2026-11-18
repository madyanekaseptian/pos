import { CashierSession } from './CashierSession.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'
import { ProductCatalog } from './ProductCatalog.js'

// --- 1. INISIALISASI KOMPONEN UTAMA ---
const catalog = new ProductCatalog()
const inventory = new Inventory()
const orderRepo = new OrderRepository()
const checkoutService = new CheckoutService(inventory, orderRepo)
const cashier = new CashierSession(catalog, inventory, checkoutService, 0.11)

// --- 2. PENDAFTARAN MASTER MENU (ADMIN/OWNER) ---
const coffee = new Product('P01', 'SKU-001', 'Iced Latte', 25000)
const pastry = new Product('P02', 'SKU-002', 'Croissant', 30000)
const water = new Product('P03', 'SKU-003', 'Mineral Water', 8000)

catalog.register(coffee)
catalog.register(pastry)
catalog.register(water)

// --- 3. PENGISIAN STOK GUDANG (INVENTORY) ---
// Bagian gudang bisa mengambil objek produk dari catalog menggunakan findById
const item1 = catalog.findById('P01')
const item2 = catalog.findById('P02')
if (item1) inventory.restock(item1, 10)
if (item2) inventory.restock(item2, 5)
// Catatan: P03 (Mineral Water) sengaja belum di-restock (stok = 0)

// =========================================================
// TEST 1: Kasir Scan Barcode (Memakai findBySku)
// =========================================================
console.log('--- TEST 1: SCAN BARCODE (SKU) ---')
cashier.scanBarcode('SKU-001', 2) // Scan 2 Iced Latte via barcode
console.log(
  'Isi keranjang setelah scan SKU-001:',
  cashier.getCartItems().length,
)

// =========================================================
// TEST 2: Kasir Klik Tombol Layar Sentuh (Memakai findById)
// =========================================================
console.log('\n--- TEST 2: SELECT PRODUCT (ID) ---')
cashier.selectProduct('P02', 1) // Klik tombol Croissant di layar kasir
console.log('Ringkasan Tagihan:', cashier.getBillSummary())
// Ekspektasi: Subtotal 80.000 (50rb + 30rb), Pajak 11% = 8.800, Total = 88.800

// =========================================================
// TEST 3: Edge Case Produk Terdaftar di Menu Tapi Stok 0
// =========================================================
console.log('\n--- TEST 3: PRODUK ADA DI CATALOG TAPI STOK KOSONG ---')
try {
  cashier.scanBarcode('SKU-003', 1) // Mineral Water ada di catalog, tapi stok 0
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 4: Edge Case Barcode / ID Tidak Terdaftar di Menu
// =========================================================
console.log('\n--- TEST 4: BARCODE TIDAK DIKENAL ---')
try {
  cashier.scanBarcode('SKU-999', 1)
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 5: Checkout & Cek Sisa Stok
// =========================================================
console.log('\n--- TEST 5: CHECKOUT ---')
const receipt = cashier.checkout(100000)
console.log('Order ID:', receipt.id, '| Kembalian:', receipt.change)
console.log('Sisa stok P01 (Ekspektasi 8):', inventory.getItem('P01')?.quantity)
console.log('Sisa stok P02 (Ekspektasi 4):', inventory.getItem('P02')?.quantity)
