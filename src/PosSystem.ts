import { CashierTerminal } from './CashierTerminal.js'
import { CheckoutService } from './CheckoutService.js'
import { Inventory } from './Inventory.js'
import { OrderRepository } from './OrderRepository.js'
import { Product } from './Product.js'
import { ProductCatalog } from './ProductCatalog.js'
import type { Refund } from './Refund.js'
import { RefundService } from './RefundService.js'

interface PosConfig {
  taxRate?: number
}

export class PosSystem {
  public readonly catalog: ProductCatalog
  public readonly inventory: Inventory
  public readonly orders: OrderRepository
  public readonly cashier: CashierTerminal

  private readonly checkoutService: CheckoutService
  private readonly refundService: RefundService

  constructor(config: PosConfig = {}) {
    const taxRate = config.taxRate ?? 0

    // Merakit seluruh sub-sistem secara otomatis di balik layar
    this.catalog = new ProductCatalog()
    this.inventory = new Inventory()
    this.orders = new OrderRepository()
    this.checkoutService = new CheckoutService(this.inventory, this.orders)
    this.refundService = new RefundService(
      this.orders,
      this.inventory,
      this.catalog,
    )
    this.cashier = new CashierTerminal(
      this.catalog,
      this.inventory,
      this.checkoutService,
      taxRate,
    )
  }

  // --- HELPER ADMIN: Daftar produk baru sekaligus isi stok awal (opsional) ---
  addProduct(
    id: string,
    sku: string,
    name: string,
    price: number,
    initialStock: number = 0,
  ): Product {
    const product = new Product(id, sku, name, price)
    this.catalog.register(product)

    if (initialStock > 0) {
      this.inventory.restock(product, initialStock)
    }

    return product
  }

  restockProduct(productId: string, quantity: number): void {
    const product = this.catalog.findById(productId)
    if (!product) {
      throw new Error(`Product ID "${productId}" not found in catalog.`)
    }
    this.inventory.restock(product, quantity)
  }

  // --- OPERASI REFUND ---
  processRefund(
    orderId: string,
    items: { productId: string; quantity: number; restockable?: boolean }[],
    reason: string,
  ): Refund {
    return this.refundService.processRefund(orderId, items, reason)
  }

  // --- LAPORAN SINGKAT TOKO ---
  getStoreSummary() {
    const grossRevenue = this.orders.getTotalRevenue()
    const totalRefunded = this.refundService
      .getAllRefunds()
      .reduce((sum, ref) => sum + ref.totalRefundAmount, 0)

    return {
      totalTransactions: this.orders.getAllOrders().length,
      totalRefunds: this.refundService.getAllRefunds().length,
      grossRevenue,
      totalRefunded,
      netRevenue: grossRevenue - totalRefunded,
    }
  }
}
