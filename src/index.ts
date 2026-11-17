import { Cart } from './Cart.js'
import { Inventory } from './Inventory.js'
import { Product } from './Product.js'

/**
  UJI COBA:
  • Skenario 1 (Restock & Anti-Duplikat): Memasukkan produk yang sama dua kali ke Inventory dan memastikan stoknya tergabung dengan benar.
  • Skenario 2 (Scan Kasir): Memasukkan produk ke Cart berkali-kali, mengurangi jumlahnya, dan memastikan totalAmount terhitung akurat.
  • Skenario 3 (Validasi Stok Sebelum Checkout): Memastikan kasir tidak bisa memproses pembayaran jika jumlah di Cart melebihi stok yang tersedia di Inventory.
  • Skenario 4 (Checkout Sukses): Memotong stok di Inventory sesuai isi Cart, lalu mengosongkan Cart (cart.clear()) untuk pelanggan berikutnya.
 */

// --- SETUP DATA AWAL ---
const inventory = new Inventory()
const mouse = new Product('A1B2', 'Logitech M650', 500000)
const keyboard = new Product('A1B3', 'Logitech Keys to Go 2', 1000000)

// Isi stok gudang
inventory.restock(mouse, 5)
inventory.restock(keyboard, 5)

// Isi stok gudang
const cart = new Cart()

// Kasir scan 2 mouse dan 1 keyboard
cart.addItem(mouse, 2)
cart.addItem(keyboard)

console.log('Total Belanja:', cart.totalAmount) // Ekspektasi: 2000000

// --- PROSES CHECKOUT SEDERHANA ---
function checkout(cart: Cart, inventory: Inventory): void {
  if (cart.isEmpty) {
    throw new Error('Cannot checkout an empty cart.')
  }

  // Ubah isi Cart menjadi format yang diminta fulfillOrder
  const orderItems = cart.getAllItems().map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }))

  // Potong stok di inventory (otomatis melempar error jika stok kurang)
  inventory.fulfillOrder(orderItems)

  // Kosongkan keranjang setelah stok berhasil dipotong
  const finalTotal = cart.totalAmount
  cart.clear()

  console.log(`Checkout berhasil! Total dibayar: Rp${finalTotal}`)
}

// Jalankan Checkout 1 (Sukses)
checkout(cart, inventory)
console.log('Sisa stok mouse:', inventory.getItem('A1B2')?.quantity) // Ekspektasi: 3

// Jalankan Checkout 2 (Uji Coba Error Stok Kurang)
try {
  cart.addItem(keyboard, 5) // Sisa stok cuma 4, tapi pelanggan minta 5
  checkout(cart, inventory)
} catch (error) {
  console.error('Transaksi ditolak sesuai harapan:', (error as Error).message)
}
