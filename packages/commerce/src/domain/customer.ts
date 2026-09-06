export interface Customer {
  readonly id: string;
  readonly email: string;
  readonly registeredAt: string;
  readonly country: string;
  readonly source: string;
}

export interface CustomerProjectionState {
  readonly customers: Readonly<Record<string, Customer>>;
  readonly totalCustomers: number;
  readonly totalOrders: number;
  readonly paidOrders: number;
  readonly lifetimeRevenue: number;
}
