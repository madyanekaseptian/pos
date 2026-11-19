import { CashDrawer, type CashDrawerClosingReport } from './CashDrawer.js'
import type { User } from './User.js'

interface ShiftSummary {
  readonly shiftId: string
  readonly cashier: User
  readonly openedAt: Date
  readonly closedAt: Date
  readonly drawerReport: CashDrawerClosingReport
}

export class ShiftSession {
  public readonly drawer: CashDrawer
  private currentUser: User | null = null
  private shiftId: string | null = null
  private openedAt: Date | null = null
  private closeShifts: ShiftSummary[] = []

  constructor() {
    this.drawer = new CashDrawer()
  }

  get isActive(): boolean {
    return this.currentUser !== null && this.drawer.isOpen
  }

  get activeCashier(): User | null {
    return this.currentUser
  }

  // 1. Kasir memulai shift & membuka laci dengan modal awal
  openShift(user: User, startingCash: number): void {
    if (this.isActive)
      throw new Error(
        `Cannot open a new shift. Shift is currently active for ${this.currentUser?.name}.`,
      )

    this.drawer.open(startingCash)
    this.currentUser = user
    this.shiftId = `SHF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    this.openedAt = new Date()
  }

  // 2. Penjaga keamanan agar transaksi ditolak jika belum ada shift aktif
  ensureActiveShift(): User {
    if (!this.isActive || !this.currentUser)
      throw new Error('No active shift session. Please open a shift first.')
    return this.currentUser
  }

  // 3. Kasir mengakhiri shift & menyetor uang fisik di laci
  closeShift(actualPhysicalCash: number): ShiftSummary {
    const cashier = this.ensureActiveShift()
    const drawerReport = this.drawer.close(actualPhysicalCash)

    const summary: ShiftSummary = {
      shiftId: this.shiftId!,
      cashier,
      openedAt: this.openedAt!,
      closedAt: new Date(),
      drawerReport,
    }

    this.closeShifts.push(summary)

    // Reset state untuk shift berikutnya
    this.currentUser = null
    this.shiftId = null
    this.openedAt = null

    return summary
  }

  getClosedShifts(): readonly ShiftSummary[] {
    return Object.freeze([...this.closeShifts])
  }
}
