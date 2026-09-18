export type DashboardSectionId =
  | "overview"
  | "revenue"
  | "customers"
  | "products"
  | "sessions"
  | "funnel"
  | "retention";

export interface DashboardSectionModel {
  readonly id: DashboardSectionId;
  readonly title: string;
  readonly description: string;
}

export const DASHBOARD_SECTIONS: readonly DashboardSectionModel[] = Object.freeze([
  { id: "overview", title: "Overview", description: "High-level commerce performance." },
  { id: "revenue", title: "Revenue", description: "Revenue and order performance." },
  { id: "customers", title: "Customers", description: "Customer and retention behavior." },
  { id: "products", title: "Products", description: "Product interest and sales performance." },
  { id: "sessions", title: "Sessions", description: "Session engagement and behavior." },
  { id: "funnel", title: "Funnel", description: "Commerce funnel progression." },
  { id: "retention", title: "Retention", description: "Customer cohort retention." },
]);
