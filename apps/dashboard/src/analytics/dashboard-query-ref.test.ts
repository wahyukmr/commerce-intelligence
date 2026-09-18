import { describe, expect, it, vi } from "vitest";

import { defineDashboardQueryRef } from "./dashboard-query-ref";

describe("defineDashboardQueryRef", () => {
  it("creates an immutable query descriptor", () => {
    const ref = defineDashboardQueryRef<{ range: string }, number>("commerce.revenue.summary");

    expect(ref.name).toBe("commerce.revenue.summary");
    expect(Object.isFrozen(ref)).toBe(true);
  });

  it("rejects an empty query name", () => {
    expect(() => defineDashboardQueryRef("   ")).toThrow("Dashboard query name must not be empty.");
  });

  it("delegates execution through the dashboard query service", () => {
    const execute = vi.fn().mockReturnValue(42);
    const service = { execute } as never;
    const ref = defineDashboardQueryRef<{ limit: number }, number>("commerce.product.top");

    expect(ref.execute(service, { limit: 5 })).toBe(42);
    expect(execute).toHaveBeenCalledWith("commerce.product.top", { limit: 5 });
  });
});
