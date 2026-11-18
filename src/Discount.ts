// 1. Discount Strategy (Interface & Implementations)
export interface DiscountRule {
  readonly name: string
  calculateDiscount(subtotal: number): number
}

export class PercentageDiscount implements DiscountRule {
  constructor(
    public readonly name: string,
    private readonly percentage: number, // e.g., 10 for 10%
  ) {
    if (percentage < 0 || percentage > 100)
      throw new Error('Discount percentage must be between 0 and 100.')
  }

  calculateDiscount(subtotal: number): number {
    return (subtotal * this.percentage) / 100
  }
}

export class FixedAmountDiscount implements DiscountRule {
  constructor(
    public readonly name: string,
    private readonly amount: number, // e.g., 15000 for Rp15.000
  ) {
    if (amount < 0) throw new Error('Discount amount cannot be negative.')
  }

  calculateDiscount(subtotal: number): number {
    // Discount cannot exceed the subtotal
    return Math.min(subtotal, this.amount)
  }
}
