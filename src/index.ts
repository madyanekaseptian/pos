import { Inventory } from './Inventory.js'
import { Product } from './Product.js'

const inventory = new Inventory()

const mouse = new Product('A1B2', 'Logitech M650', 500000)
const keyboard = new Product('A1B3', 'Logitech Keys to Go 2', 1000000)

inventory.restock(mouse, 5)
inventory.restock(keyboard, 5)

inventory.fulfillOrder([
  { productId: 'A1B2', quantity: 2 },
  { productId: 'A1B3', quantity: 1 },
])

console.log(inventory.getAllItems())
