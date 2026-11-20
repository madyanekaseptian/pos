import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline/promises'
import { PosSystem } from './PosSystem.js'
import { User } from './User.js'

// --- SETUP SISTEM & DUMMY PRODUK ---
const pos = new PosSystem({ taxRate: 0.11 })

pos.addProduct('P01', 'SKU-001', 'Iced Latte', 25000, 15)
pos.addProduct('P02', 'SKU-002', 'Americano', 20000, 20)
pos.addProduct('P03', 'SKU-003', 'Butter Croissant', 30000, 10)
pos.addProduct('P04', 'SKU-004', 'Matcha Cheesecake', 45000, 8)

const rl = readline.createInterface({ input, output })
const STARTING_CASH = 500000

// Helper untuk menggambar Blok 1 (Header), Blok 2 (Keranjang), & Blok 3 (Daftar Produk)
function renderTopBlocks() {
  console.clear()

  // BLOK 1: HEADER
  console.log('==================================================')
  console.log(`Kasir Bertugas : ${pos.shift.activeCashier?.name}`)
  console.log(
    `Saldo Awal     : Rp${STARTING_CASH.toLocaleString('id-ID')} | Saldo Sekarang: Rp${pos.shift.drawer.currentBalance.toLocaleString('id-ID')}`,
  )
  console.log('==================================================\n')

  // BLOK 2: ISI KERANJANG AKTIF
  console.log('--- KERANJANG BELANJA ---')
  const cartItems = pos.cashier.getCartItems()
  if (cartItems.length === 0) {
    console.log('(Keranjang masih kosong)')
  } else {
    for (const item of cartItems) {
      console.log(
        `- ${item.product.name.padEnd(20)} (${item.quantity}x) | Rp${item.subtotal.toLocaleString('id-ID').padStart(8)}`,
      )
    }
    const summary = pos.cashier.getBillSummary()
    console.log('--------------------------------------------------')
    console.log(
      `Subtotal: Rp${summary.subtotal.toLocaleString('id-ID')} | Diskon: -Rp${summary.discount.toLocaleString('id-ID')} | Pajak: Rp${summary.tax.toLocaleString('id-ID')}`,
    )
    console.log(
      `TOTAL TAGIHAN: Rp${summary.grandTotal.toLocaleString('id-ID')}`,
    )
  }
  console.log('--------------------------------------------------\n')

  // BLOK 3: DAFTAR MENU PRODUK
  console.log('--- DAFTAR MENU PRODUK ---')
  for (const product of pos.catalog.getAllProducts()) {
    const stock = pos.inventory.getItem(product.id)?.quantity ?? 0
    console.log(
      `[${product.id}] ${product.name.padEnd(20)} | Rp${product.price.toLocaleString('id-ID').padStart(7)} | Stok: ${stock}`,
    )
  }
  console.log('--------------------------------------------------\n')
}

async function main() {
  console.clear()
  const rawName = await rl.question(
    "Masukkan nama kasir (Enter untuk default 'Kasir'): ",
  )
  const cashierName = rawName.trim() || 'Kasir'

  const user = new User(`U-${Date.now()}`, cashierName, 'CASHIER')
  pos.shift.openShift(user, STARTING_CASH)

  let isRunning = true
  let statusMessage = ''

  while (isRunning) {
    renderTopBlocks()

    // BLOK 4: MENU AKSI UTAMA
    console.log('--- MENU KASIR ---')
    console.log('1. Tambah ke Keranjang')
    console.log('2. Bayar / Checkout')
    console.log('0. Tutup Shift & Keluar')
    console.log('------------------')

    // BLOK 5: PROMPT INPUT & STATUS
    if (statusMessage) {
      console.log(`\n${statusMessage}`)
      statusMessage = ''
    }

    const choice = (await rl.question('\nPilih menu: ')).trim()

    if (choice === '1') {
      renderTopBlocks()

      // BLOK 4 (Mode Input)
      console.log('--- TAMBAH KE KERANJANG ---')
      console.log('(Kosongkan ID untuk batal)')
      console.log('---------------------------')

      // BLOK 5 (Prompt Input ID)
      const prodId = (await rl.question('\nMasukkan ID Produk (misal P01): '))
        .trim()
        .toUpperCase()

      if (!prodId) {
        statusMessage = '[INFO] Batal menambahkan barang.'
        continue
      }

      const product = pos.catalog.findById(prodId)
      if (!product) {
        statusMessage = `[ERROR] Produk dengan ID "${prodId}" tidak ditemukan di daftar menu.`
        continue
      }

      const qtyInput = await rl.question(
        `Masukkan Qty untuk ${product.name} (default 1): `,
      )
      const qty = qtyInput.trim() === '' ? 1 : Number(qtyInput)

      try {
        pos.cashier.selectProduct(prodId, qty)
        statusMessage = `[SUKSES] ${qty}x ${product.name} masuk ke keranjang.`
      } catch (error) {
        statusMessage = `[ERROR] ${(error as Error).message}`
      }
    } else if (choice === '2') {
      if (pos.cashier.getCartItems().length === 0) {
        statusMessage =
          '[ERROR] Keranjang masih kosong. Tambahkan barang terlebih dahulu.'
        continue
      }

      // --- SUB-LOOP PEMBAYARAN ---
      let inPaymentMenu = true
      let paymentMessage = ''

      while (inPaymentMenu) {
        renderTopBlocks()
        const summary = pos.cashier.getBillSummary()

        // BLOK 4 (Sub-Menu Pembayaran)
        console.log('--- MENU PEMBAYARAN ---')
        console.log(
          `Total Tagihan: Rp${summary.grandTotal.toLocaleString('id-ID')}`,
        )
        console.log('1. Masukkan Nominal Pembayaran')
        console.log('2. Kembali ke Menu Utama (Simpan Keranjang)')
        console.log('3. Batalkan Pembelian (Reset Keranjang)')
        console.log('-----------------------')

        // BLOK 5 (Status & Prompt Sub-Menu Pembayaran)
        if (paymentMessage) {
          console.log(`\n${paymentMessage}`)
          paymentMessage = ''
        }

        const payChoice = (
          await rl.question('\nPilih opsi pembayaran (1-3): ')
        ).trim()

        if (payChoice === '1') {
          const paidInput = (
            await rl.question('Masukkan uang tunai diterima: ')
          ).trim()
          const amountPaid = Number(paidInput)

          if (!paidInput || Number.isNaN(amountPaid)) {
            paymentMessage = '[PERINGATAN] Masukkan nominal angka yang valid.'
            continue
          }

          if (amountPaid < summary.grandTotal) {
            const kurang = summary.grandTotal - amountPaid
            paymentMessage = `[PERINGATAN] Uang kurang Rp${kurang.toLocaleString('id-ID')}. Silakan pilih opsi 1 untuk input ulang.`
            continue
          }

          try {
            const receipt = pos.cashier.checkout(amountPaid)
            statusMessage = `[TRANSAKSI SUKSES] Order ID: ${receipt.id} | Total: Rp${receipt.grandTotal.toLocaleString('id-ID')} | Bayar: Rp${receipt.amountPaid.toLocaleString('id-ID')} | Kembalian: Rp${receipt.change.toLocaleString('id-ID')}`
            inPaymentMenu = false
          } catch (error) {
            paymentMessage = `[ERROR] ${(error as Error).message}`
          }
        } else if (payChoice === '2') {
          statusMessage =
            '[INFO] Kembali ke menu utama. Item di keranjang tetap tersimpan.'
          inPaymentMenu = false
        } else if (payChoice === '3') {
          pos.cashier.clearCart()
          statusMessage =
            '[INFO] Pembelian dibatalkan dan keranjang telah dikosongkan.'
          inPaymentMenu = false
        } else {
          paymentMessage =
            '[PERINGATAN] Pilihan tidak valid. Ketik 1, 2, atau 3.'
        }
      }
    } else if (choice === '0') {
      renderTopBlocks()

      // BLOK 4 (Mode Tutup Shift)
      console.log('--- KONFIRMASI TUTUP SHIFT ---')
      console.log('------------------------------')

      // 1. Cek apakah masih ada item di keranjang
      if (pos.cashier.getCartItems().length > 0) {
        const resetConfirm = (
          await rl.question(
            '\n[PERINGATAN] Masih ada item di keranjang. Reset keranjang untuk lanjut tutup shift? (y/n): ',
          )
        )
          .trim()
          .toLowerCase()

        if (resetConfirm !== 'y') {
          statusMessage =
            '[INFO] Tutup shift dibatalkan karena keranjang belum dikosongkan.'
          continue
        }

        pos.cashier.clearCart()
        renderTopBlocks()
        console.log('--- KONFIRMASI TUTUP SHIFT ---')
        console.log('------------------------------')
      }

      // 2. Verifikasi nama kasir yang sedang bertugas
      const activeName = pos.shift.activeCashier?.name ?? ''
      const confirmName = (
        await rl.question(
          `\nKetik nama kasir aktif ("${activeName}") untuk konfirmasi tutup shift: `,
        )
      ).trim()

      if (confirmName.toLowerCase() !== activeName.toLowerCase()) {
        statusMessage =
          '[ERROR] Nama kasir tidak sesuai. Penutupan shift ditolak.'
        continue
      }

      // 3. Input uang fisik laci & tutup shift resmi
      const actualCashInput = (
        await rl.question(
          'Masukkan total uang fisik di laci kas sekarang (kosongkan = sesuai sistem): ',
        )
      ).trim()

      const actualCash =
        actualCashInput === ''
          ? pos.shift.drawer.currentBalance
          : Number(actualCashInput)

      if (Number.isNaN(actualCash) || actualCash < 0) {
        statusMessage =
          '[ERROR] Nominal uang fisik tidak valid. Penutupan shift dibatalkan.'
        continue
      }

      const report = pos.shift.closeShift(actualCash)

      console.clear()
      console.log('==================================================')
      console.log('               LAPORAN TUTUP SHIFT                ')
      console.log('==================================================')
      console.log(`Shift ID      : ${report.shiftId}`)
      console.log(`Kasir         : ${report.cashier.name}`)
      console.log(
        `Saldo Sistem  : Rp${report.drawerReport.expectedCash.toLocaleString('id-ID')}`,
      )
      console.log(
        `Uang Fisik    : Rp${report.drawerReport.actualCash.toLocaleString('id-ID')}`,
      )
      console.log(
        `Selisih Kas   : Rp${report.drawerReport.discrepancy.toLocaleString('id-ID')}`,
      )
      console.log('==================================================\n')

      isRunning = false
    } else {
      statusMessage = '[ERROR] Pilihan tidak valid. Ketik 1, 2, atau 0.'
    }
  }

  rl.close()
}

main()
