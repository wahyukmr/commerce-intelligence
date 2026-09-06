export interface OrderItem {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export type OrderStatus = "placed" | "paid" | "cancelled" | "refunded";

export interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly placedAt: string;
  readonly currency: string;
  readonly items: readonly OrderItem[];
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly shipping: number;
  readonly total: number;
  readonly status: OrderStatus;
  readonly paidAt: string | null;
  readonly cancelledAt: string | null;
}

export interface OrderProjectionState {
  readonly orders: Readonly<Record<string, Order>>;
  readonly totalOrders: number;
  readonly paidOrders: number;
  readonly cancelledOrders: number;
  readonly refundedOrders: number;
  readonly grossRevenue: number;
  readonly refundedRevenue: number;
}
