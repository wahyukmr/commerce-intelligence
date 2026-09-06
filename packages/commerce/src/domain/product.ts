export interface Product {
  readonly id: string;
}

export interface ProductAnalytics {
  readonly productId: string;
  readonly orderCount: number;
  readonly unitsOrdered: number;
  readonly merchandiseValue: number;
  readonly averageUnitPrice: number;
}

export interface ProductAnalyticsProjectionState {
  readonly currency: string | null;
  readonly products: Readonly<Record<string, ProductAnalytics>>;
}
