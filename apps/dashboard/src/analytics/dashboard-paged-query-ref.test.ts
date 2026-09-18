import { describe, expect, it, vi } from "vitest";
import { defineDashboardPagedQueryRef } from "./dashboard-paged-query-ref";

describe("defineDashboardPagedQueryRef", () => {
  it("rejects an empty query name", () => {
    expect(() => defineDashboardPagedQueryRef("")).toThrow();
  });

  it("delegates to executePage with the supplied page request", () => {
    const ref = defineDashboardPagedQueryRef<
      { readonly category: string },
      { readonly items: readonly string[] }
    >("commerce.product.analytics.top");

    const executePage = vi.fn(() => ({
      items: ["a"],
    }));

    const service = {
      executePage,
    } as never;

    const result = ref.execute(service, { category: "shoes" }, { offset: 20, limit: 10 });

    expect(result).toEqual({ items: ["a"] });
    expect(executePage).toHaveBeenCalledWith(
      "commerce.product.analytics.top",
      { category: "shoes" },
      { offset: 20, limit: 10 },
    );
  });
});
