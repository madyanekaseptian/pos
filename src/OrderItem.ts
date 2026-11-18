// Immutable Snapshot of Purchased Item
export class OrderItem {
  public readonly subtotal: number

  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly unitPrice: number,
    public readonly quantity: number,
    public readonly discountAmount: number = 0,
  ) {
    this.subtotal = unitPrice * quantity - discountAmount
  }
}
