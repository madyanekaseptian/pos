import { PercentageDiscount } from './Discount.js'
import { PosSystem } from './PosSystem.js'

// 1. Inisialisasi seluruh sistem PoS dengan pajak PPN 11%
const pos = new PosSystem({ taxRate: 0.11 })

// 2. Setup Menu & Stok Awal
pos.addProduct('P01', 'SKU-001', 'Iced Latte', 25000, 10)
pos.addProduct('P02', 'SKU-002', 'Croissant', 30000, 5)

// 3. Alur Kasir Belanja
pos.cashier.scanBarcode('SKU-001', 2) // 2 x 25.000 = 50.000
pos.cashier.selectProduct('P02', 1) // 1 x 30.000 = 30.000
// Total Subtotal saat ini = 80.000

// Terapkan Diskon Keranjang 10% (Potongan 8.000 -> Harga kena pajak = 72.000)
pos.cashier.applyDiscount(new PercentageDiscount('Opening Promo', 10))

// Pajak 11% dari 72.000 = 7.920
// Grand Total = 72.000 + 7.920 = 79.920
const order = pos.cashier.checkout(100000)

console.log('--- HASIL CHECKOUT ---')
console.log('Subtotal (Ekspektasi 80000):', order.subtotal)
console.log('Diskon (Ekspektasi 8000):', order.discountAmount)
console.log('Pajak (Ekspektasi 7920):', order.taxAmount)
console.log('Grand Total (Ekspektasi 79920):', order.grandTotal)
console.log('Kembalian (Ekspektasi 20080):', order.change)
console.log(
  'Sisa Stok Croissant (Ekspektasi 4):',
  pos.inventory.getItem('P02')?.quantity,
)

// 4. Alur Retur Barang (Retur 1 Croissant senilai 30.000)
const refund = pos.processRefund(
  order.id,
  [{ productId: 'P02', quantity: 1, restockable: true }],
  'Customer changed mind',
)

console.log('\n--- HASIL REFUND ---')
console.log('Nominal Refund (Ekspektasi 30000):', refund.totalRefundAmount)
console.log(
  'Stok Croissant Kembali (Ekspektasi 5):',
  pos.inventory.getItem('P02')?.quantity,
)

// 5. Cek Laporan Keuangan Bersih Toko
// Omzet Kotor: 79.920 | Total Refund: 30.000 | Omzet Bersih: 49.920
console.log('\n--- LAPORAN TOKO ---')
console.log(
  'Summary (Ekspektasi { totalTransactions: 1, totalRefunds: 1, grossRevenue: 79920, totalRefunded: 30000, netRevenue: 49920 }):',
)
console.log(pos.getStoreSummary())
