import type { Product } from './Product.js'

export class ProductCatalog {
  private products: Map<string, Product> = new Map()

  register(product: Product): void {
    if (this.products.has(product.id))
      throw new Error(`Product ID ${product.id} is already registered.`)

    if (this.findBySku(product.sku))
      throw new Error(`SKU ${product.sku} is already registered.`)

    this.products.set(product.id, product)
  }

  findById(productId: string): Product | undefined {
    return this.products.get(productId)
  }

  findBySku(sku: string): Product | undefined {
    for (const product of this.products.values()) {
      if (product.sku === sku) return product
    }
    return undefined
  }

  searchByName(keyword: string): Product[] {
    const query = keyword.trim().toLowerCase()
    return this.getAllProducts().filter((product) =>
      product.name.toLowerCase().includes(query),
    )
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values())
  }
}
