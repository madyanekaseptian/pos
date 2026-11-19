import { Cart } from './Cart.js'
import type { CartItem } from './CartItem.js'
import type { CheckoutService } from './CheckoutService.js'
import type { DiscountRule } from './Discount.js'
import type { Inventory } from './Inventory.js'
import type { Order } from './Order.js'
import type { Product } from './Product.js'
import type { ProductCatalog } from './ProductCatalog.js'

export class CashierTerminal {
  private cart: Cart = new Cart()

  constructor(
    private readonly catalog: ProductCatalog,
    private readonly inventory: Inventory,
    private readonly checkoutService: CheckoutService,
    defaultTaxRate: number = 0,
  ) {
    // Cart diinisialisasi otomatis dengan tarif pajak toko
    this.cart = new Cart(defaultTaxRate)
  }

  // Helper private agar tidak duplikasi logika cek stok
  private addProductToCart(product: Product, quantity: number): void {
    const inventoryItem = this.inventory.getItem(product.id)
    const availableStock = inventoryItem ? inventoryItem.quantity : 0
    this.cart.addItem(product, quantity, availableStock)
  }

  // --- OPERASI BARANG ---
  // Kasir scan barcode fisik (memakai findBySku)
  scanBarcode(sku: string, quantity: number = 1): void {
    const product = this.catalog.findBySku(sku)
    if (!product) throw new Error(`Barcode/SKU "${sku}" not found in catalog.`)
    this.addProductToCart(product, quantity)
  }

  // Digunakan saat kasir mengetuk gambar/tombol menu di layar sentuh
  // (misalnya untuk produk tanpa barcode seperti kopi seduh atau kue di etalase),
  // di mana UI mengirimkan productId ("P01") lalu dicari lewat catalog.findById(productId).
  selectProduct(productId: string, quantity: number = 1): void {
    const product = this.catalog.findById(productId)
    if (!product)
      throw new Error(`Product ID "${productId}" not found in catalog.`)
    this.addProductToCart(product, quantity)
  }

  decreaseProduct(productId: string, quantity: number): void {
    this.cart.decreaseItem(productId, quantity)
  }

  removeProduct(productId: string): void {
    this.cart.removeItem(productId)
  }

  // --- OPERASI DISKON ---
  applyDiscount(discount: DiscountRule): void {
    this.cart.applyDiscount(discount)
  }

  removeDiscount(): void {
    this.cart.removeDiscount()
  }

  applyItemDiscount(productId: string, discount: DiscountRule): void {
    this.cart.applyItemDiscount(productId, discount)
  }

  removeItemDiscount(productId: string): void {
    this.cart.removeItemDiscount(productId)
  }

  // --- INFORMASI LAYAR KASIR ---
  getCartItems(): CartItem[] {
    return this.cart.getAllItems()
  }

  getBillSummary(): Record<string, number> {
    return {
      subtotal: this.cart.subtotal,
      discount: this.cart.discountAmount,
      tax: this.cart.taxAmount,
      grandTotal: this.cart.grandTotal,
    }
  }

  checkout(amountPaid: number): Order {
    return this.checkoutService.processCheckout(this.cart, amountPaid)
  }
}
