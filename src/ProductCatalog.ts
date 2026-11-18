import type { Product } from './Product.js'

export class ProductCatalog {
  private products: Map<string, Product> = new Map()
  private skuIndex: Map<string, Product> = new Map() // Index tambahan agar scan barcode cepat

  register(product: Product): void {
    if (this.products.has(product.id))
      throw new Error(`Product ID ${product.id} is already registered.`)

    if (this.skuIndex.has(product.sku))
      throw new Error(`SKU ${product.sku} is already registered.`)

    this.products.set(product.id, product)
    this.skuIndex.set(product.sku, product)
  }

  findById(productId: string): Product | undefined {
    return this.products.get(productId)
  }

  findBySku(sku: string): Product | undefined {
    return this.skuIndex.get(sku)
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values())
  }
}
