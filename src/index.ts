import { PosSystem } from './PosSystem.js'
import { User } from './User.js'

const pos = new PosSystem({ taxRate: 0.1 }) // Pajak 10%
pos.addProduct('P01', 'SKU-001', 'Iced Latte', 20000, 10)

const andi = new User('U01', 'Andi', 'CASHIER')
const budi = new User('U02', 'Budi', 'CASHIER')

// =========================================================
// TEST 1: Transaksi Ditolak Jika Belum Buka Shift
// =========================================================
console.log('--- TEST 1: BELUM BUKA SHIFT ---')
try {
  pos.cashier.scanBarcode('SKU-001', 1)
  pos.cashier.checkout(25000)
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 2: Andi Buka Shift Pagi (Modal Rp500.000)
// =========================================================
console.log('\n--- TEST 2: ANDI BUKA SHIFT & TRANSAKSI ---')
pos.shift.openShift(andi, 500000)

pos.cashier.scanBarcode('SKU-001', 1) // Tambah 1 lagi (total di keranjang jadi 2 Latte = 44.000)

// Beli 2 Latte = 40.000 + Pajak 10% (4.000) = 44.000
const order = pos.cashier.checkout(50000)
console.log(
  'Saldo Laci Setelah Jual (Ekspektasi 544000):',
  pos.shift.drawer.currentBalance,
)

// Retur 1 Latte = 20.000 + Pajak 10% (2.000) = 22.000
pos.processRefund(order.id, [{ productId: 'P01', quantity: 1 }], 'Wrong order')
console.log(
  'Saldo Laci Setelah Refund (Ekspektasi 522000):',
  pos.shift.drawer.currentBalance,
)

// =========================================================
// TEST 3: Tutup Shift Andi & Ganti Shift Budi
// =========================================================
console.log('\n--- TEST 3: TUTUP SHIFT ANDI ---')
const summaryAndi = pos.shift.closeShift(522000) // Uang fisik pas 522.000
console.log('Kasir Bertugas (Ekspektasi Andi):', summaryAndi.cashier.name)
console.log('Selisih Kas (Ekspektasi 0):', summaryAndi.drawerReport.discrepancy)

// Budi sekarang bisa membuka shift sore
pos.shift.openShift(budi, 300000)
console.log(
  'Shift Aktif Sekarang (Ekspektasi Budi):',
  pos.shift.activeCashier?.name,
)
console.log(
  'Total Riwayat Shift Selesai (Ekspektasi 1):',
  pos.shift.getClosedShifts().length,
)
