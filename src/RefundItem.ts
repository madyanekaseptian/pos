// Model Data Refund (Immutable Receipt for Return)
export class RefundItem {
  public readonly refundSubtotal: number

  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly unitRefundPrice: number,
    public readonly quantity: number,
    public readonly restockable: boolean = true,
  ) {
    this.refundSubtotal = unitRefundPrice * quantity
  }
}
