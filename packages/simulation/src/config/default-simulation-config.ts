import type { SimulationConfig } from "./simulation-config";

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  tenantId: "tenant-demo",
  seed: 42,
  totalUsers: 1_000,
  days: 30,
  startAt: "2026-01-01T00:00:00.000Z",
  products: [
    {
      id: "product-001",
      price: 100_000,
    },
    {
      id: "product-002",
      price: 150_000,
    },
    {
      id: "product-003",
      price: 200_000,
    },
    {
      id: "product-004",
      price: 250_000,
    },
    {
      id: "product-005",
      price: 300_000,
    },
  ],
  features: ["search", "recommendation", "wishlist", "reviews"],
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },
  chunkSize: 100,
};
