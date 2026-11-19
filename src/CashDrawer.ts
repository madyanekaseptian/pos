type CashTransactionType =
  | 'OPENING'
  | 'SALE'
  | 'REFUND'
  | 'CASH_IN'
  | 'CASH_OUT'

interface CashLog {
  readonly timestamp: Date
  readonly type: CashTransactionType
  readonly amount: number // Positif untuk masuk, negatif untuk keluar
  readonly balanceAfter: number
  readonly reference: string
}

export class CashDrawer {
  private _isOpen: boolean = false
  private _currentBalance: number = 0
  private logs: CashLog[] = []

  get isOpen(): boolean {
    return this._isOpen
  }

  get currentBalance(): number {
    return this._currentBalance
  }

  getLogs(): readonly CashLog[] {
    return Object.freeze([...this.logs])
  }

  // 1. Buka laci dengan modal awal (misal Rp500.000)
  open(startingCash: number): void {
    if (this._isOpen) throw new Error('Cash drawer is already open.')

    if (startingCash < 0) throw new Error('Starting cash cannot be negative.')

    this._isOpen = true
    this._currentBalance = startingCash
    this.logs = [] // Reset log untuk sesi laci baru

    this.addLog('OPENING', startingCash, 'Initial float')
  }

  // 2. Catat uang masuk dari penjualan tunai
  recordSale(amount: number, orderId: string): void {
    this.ensureOpen()
    if (amount < 0) throw new Error('Sale amount cannot be negative.')

    this._currentBalance += amount
    this.addLog('SALE', amount, `Order ${orderId}`)
  }

  // 3. Catat uang keluar dari retur barang
  recordRefund(amount: number, refundId: string): void {
    this.ensureOpen()
    if (amount < 0) throw new Error('Refund amount cannot be negative.')
    if (this._currentBalance < amount)
      throw new Error(
        `Insufficient cash in drawer for refund. Available: ${this._currentBalance}, Required: ${amount}.`,
      )

    this._currentBalance -= amount
    this.addLog('REFUND', -amount, `Refund ${refundId}`)
  }

  // 4. Tambah/ambil uang kas non-transaksi (misal tambah receh atau beli plastik)
  addCash(amount: number, reason: string): void {
    this.ensureOpen()
    if (amount <= 0) throw new Error('Amount must be greater than 0.')

    this._currentBalance += amount
    this.addLog('CASH_IN', amount, reason)
  }

  removeCash(amount: number, reason: string): void {
    this.ensureOpen()
    if (amount <= 0) throw new Error('Amount must be greater than 0.')
    if (this._currentBalance < amount)
      throw new Error('Insufficient cash in drawer.')

    this._currentBalance -= amount
    this.addLog('CASH_OUT', -amount, reason)
  }

  // 5. Tutup laci & hitung selisih uang fisik vs catatan sistem
  close(actualPhysicalCash: number) {
    this.ensureOpen()
    if (actualPhysicalCash < 0)
      throw new Error('Actual physical cash cannot be negative.')

    const expectedCash = this._currentBalance
    const discrepancy = actualPhysicalCash - expectedCash // 0 = pas, minus = tekor, plus = lebih

    this._isOpen = false
    this._currentBalance = 0

    return {
      expectedCash,
      actualCash: actualPhysicalCash,
      discrepancy,
      logs: this.getLogs(),
    }
  }

  private ensureOpen(): void {
    if (!this._isOpen)
      throw new Error(
        'Cash drawer is currently closed. Please open a session first.',
      )
  }

  private addLog(
    type: CashTransactionType,
    amount: number,
    reference: string,
  ): void {
    this.logs.push({
      timestamp: new Date(),
      type,
      amount,
      balanceAfter: this._currentBalance,
      reference,
    })
  }
}
