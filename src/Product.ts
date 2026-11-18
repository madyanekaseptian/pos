export class Product {
  constructor(
    public readonly id: string,
    public readonly sku: string,
    public name: string,
    public price: number,
  ) {}
}
