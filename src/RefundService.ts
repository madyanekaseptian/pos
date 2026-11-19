import type { Inventory } from './Inventory.js'
import type { OrderRepository } from './OrderRepository.js'
import type { ProductCatalog } from './ProductCatalog.js'
import { Refund } from './Refund.js'
import { RefundItem } from './RefundItem.js'
import type { ShiftSession } from './ShiftSession.js'

export class RefundService {
  private refunds: Map<string, Refund> = new Map()

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventory: Inventory,
    private readonly catalog: ProductCatalog,
    private readonly shiftSession: ShiftSession,
  ) {}

  processRefund(
    orderId: string,
    returnRequests: {
      productId: string
      quantity: number
      restockable?: boolean
    }[],
    reason: string,
  ): Refund {
    this.shiftSession.ensureActiveShift()

    const order = this.orderRepository.findById(orderId)
    if (!order) throw new Error(`Order ID "${orderId}" not found.`)

    if (returnRequests.length === 0)
      throw new Error('Must specify at least one item to refund.')

    const refundItems: RefundItem[] = []

    for (const req of returnRequests) {
      if (req.quantity <= 0)
        throw new Error('Refund quantity must be greater than 0.')

      // Cari item di struk asli
      const purchasedItem = order.items.find(
        (item) => item.productId === req.productId,
      )
      if (!purchasedItem)
        throw new Error(
          `Product "${req.productId}" was not part of Order "${orderId}".`,
        )

      // Hitung berapa yang sudah pernah diretur sebelumnya untuk order & produk ini
      const alreadyRefundedQty = this.getAlreadyRefundedQuantity(
        orderId,
        req.productId,
      )
      const maxReturnable = purchasedItem.quantity - alreadyRefundedQty

      if (req.quantity > maxReturnable)
        throw new Error(
          `Cannot refund ${req.quantity}x ${purchasedItem.productName}. Maximum returnable is ${maxReturnable}.`,
        )

      // --- PERHITUNGAN PRORATA (DISKON KERANJANG & PAJAK) ---
      const itemRatio =
        order.subtotal > 0 ? purchasedItem.subtotal / order.subtotal : 0
      const proratedOrderDiscount = order.discountAmount * itemRatio
      const proratedTax = order.taxAmount * itemRatio

      // Total nilai efektif yang dibayar pelanggan untuk seluruh kuantitas item ini
      const effectiveTotalPaidForItem =
        purchasedItem.subtotal - proratedOrderDiscount + proratedTax

      // Harga efektif per 1 unit barang
      const proratedUnitPrice = Math.round(
        effectiveTotalPaidForItem / purchasedItem.quantity,
      )

      const isRestockable = req.restockable ?? true

      refundItems.push(
        new RefundItem(
          purchasedItem.productId,
          purchasedItem.productName,
          proratedUnitPrice,
          req.quantity,
          isRestockable,
        ),
      )

      // Kembalikan stok ke Inventory jika barang masih layak jual
      if (isRestockable) {
        const product = this.catalog.findById(req.productId)
        if (product) this.inventory.restock(product, req.quantity)
      }
    }

    const refundId = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const refund = new Refund(refundId, orderId, refundItems, reason)
    this.refunds.set(refundId, refund)
    this.shiftSession.drawer.recordRefund(refund.totalRefundAmount, refundId)

    return refund
  }

  // Helper mencegah retur ganda melebihi jumlah beli asli
  private getAlreadyRefundedQuantity(
    orderId: string,
    productId: string,
  ): number {
    let total = 0
    for (const refund of this.refunds.values()) {
      if (refund.originalOrderId === orderId) {
        const found = refund.items.find((i) => i.productId === productId)
        if (found) total += found.quantity
      }
    }
    return total
  }

  getAllRefunds(): Refund[] {
    return Array.from(this.refunds.values())
  }
}
