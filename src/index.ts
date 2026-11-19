import { CashDrawer } from './CashDrawer.js'

const drawer = new CashDrawer()

// =========================================================
// TEST 1: Proteksi Operasi Saat Laci Masih Tertutup
// =========================================================
console.log('--- TEST 1: LACI TERTUTUP ---')
try {
  drawer.recordSale(50000, 'ORD-001')
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 2: Buka Laci & Alur Arus Kas Masuk/Keluar
// =========================================================
console.log('\n--- TEST 2: BUKA LACI & ARUS KAS ---')
drawer.open(500000) // Modal awal kembalian: Rp500.000
console.log('Saldo Awal (Ekspektasi 500000):', drawer.currentBalance)

drawer.recordSale(75000, 'ORD-001') // Penjualan masuk +75.000 -> 575.000
drawer.recordSale(125000, 'ORD-002') // Penjualan masuk +125.000 -> 700.000
drawer.removeCash(20000, 'Beli plastik & galon') // Kas keluar -20.000 -> 680.000
drawer.recordRefund(30000, 'REF-001') // Refund tunai -30.000 -> 650.000
drawer.addCash(100000, 'Tambah receh pecahan') // Kas masuk +100.000 -> 750.000

console.log('Saldo Akhir Sistem (Ekspektasi 750000):', drawer.currentBalance)

// =========================================================
// TEST 3: Proteksi Saldo Kurang Saat Refund
// =========================================================
console.log('\n--- TEST 3: PROTEKSI SALDO LACI TIDAK CUKUP ---')
try {
  drawer.recordRefund(900000, 'REF-999') // Saldo cuma 750rb, tapi mau refund 900rb
} catch (error) {
  console.log('Ditolak sesuai harapan:', (error as Error).message)
}

// =========================================================
// TEST 4: Tutup Laci & Cek Selisih Kas (Discrepancy)
// =========================================================
console.log('\n--- TEST 4: TUTUP LACI (SIMULASI UANG FISIK KURANG RP5.000) ---')
// Catatan sistem = 750.000, tapi kasir menghitung uang fisik di laci cuma ada 745.000
const closingReport = drawer.close(745000)

console.log('Expected Cash (Ekspektasi 750000):', closingReport.expectedCash)
console.log('Actual Cash (Ekspektasi 745000):', closingReport.actualCash)
console.log(
  'Discrepancy / Selisih (Ekspektasi -5000):',
  closingReport.discrepancy,
)
console.log('Status Laci Sekarang (Ekspektasi false):', drawer.isOpen)
console.log(
  'Jumlah Riwayat Log Mutasi (Ekspektasi 6):',
  closingReport.logs.length,
)
