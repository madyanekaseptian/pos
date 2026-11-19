type UserRole = 'CASHIER' | 'MANAGER'

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public role: UserRole,
  ) {}

  isManager(): boolean {
    return this.role === 'MANAGER'
  }
}
