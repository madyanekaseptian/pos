import { PercentageDiscount } from './Discount.js'
import { PosSystem } from './PosSystem.js'

const pos = new PosSystem({ taxRate: 0.11 })

pos.addProduct('P01', 'SKU-001', 'Iced Latte', 25000, 10)
pos.addProduct('P02', 'SKU-002', 'Croissant', 30000, 10)

// Beli 2 Latte (50rb) + 1 Croissant (30rb) = Subtotal 80rb
// Diskon Keranjang 10% (-8rb) -> 72rb + Pajak 11% (+7.920) -> Grand Total = 79.920
pos.cashier.scanBarcode('SKU-001', 2)
pos.cashier.selectProduct('P02', 1)
pos.cashier.applyDiscount(new PercentageDiscount('Opening Promo', 10))

const order = pos.cashier.checkout(100000)
console.log(
  'Grand Total Dibayar Pelanggan (Ekspektasi 79920):',
  order.grandTotal,
)

// Retur Tahap 1: Retur 1 Croissant
// Harga efektif Croissant: 30.000 - 3.000 (diskon 10%) + 2.970 (pajak 11%) = 29.970
const refund1 = pos.processRefund(
  order.id,
  [{ productId: 'P02', quantity: 1 }],
  'Wrong pastry',
)
console.log(
  'Refund 1 - Croissant (Ekspektasi 29970):',
  refund1.totalRefundAmount,
)

// Retur Tahap 2: Retur sisa 2 Iced Latte
// Harga efektif 2 Latte: 50.000 - 5.000 (diskon 10%) + 4.950 (pajak 11%) = 49.950
const refund2 = pos.processRefund(
  order.id,
  [{ productId: 'P01', quantity: 2 }],
  'Cancelled drinks',
)
console.log('Refund 2 - 2 Latte (Ekspektasi 49950):', refund2.totalRefundAmount)

// Verifikasi Akhir: Total semua refund harus 0 rupiah selisih dengan Grand Total!
console.log(
  'Laporan Akhir Toko (Ekspektasi netRevenue: 0):',
  pos.getStoreSummary(),
)
