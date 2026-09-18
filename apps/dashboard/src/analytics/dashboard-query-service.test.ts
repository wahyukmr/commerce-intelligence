import { createCommerceQueryComposition } from "@ci/commerce";
import type { Query } from "@ci/runtime";
import { Runtime } from "@ci/runtime";
import { describe, expect, it, vi } from "vitest";
import { CommerceDashboardQueryService } from "./dashboard-query-service";

function query(name: string): Query {
  return {
    name,
    execute: (_snapshot, input) => input,
  };
}

describe("CommerceDashboardQueryService", () => {
  it("lists every composed query", () => {
    const revenue = query("commerce.revenue.summary");
    const customer = query("commerce.customer.summary");

    const composition = createCommerceQueryComposition({
      revenue: [revenue],
      customer: [customer],
    });

    const service = new CommerceDashboardQueryService(
      new Runtime({ tenantId: "tenant-1" }),
      composition,
    );

    expect(service.list()).toEqual([revenue, customer]);
    expect(service.list("revenue")).toEqual([revenue]);
    expect(service.list("customer")).toEqual([customer]);
  });

  it("rejects unknown queries before execution", () => {
    const composition = createCommerceQueryComposition();
    const service = new CommerceDashboardQueryService(
      new Runtime({ tenantId: "tenant-1" }),
      composition,
    );

    expect(() => service.get("commerce.unknown")).toThrow(
      "Unknown commerce query: commerce.unknown",
    );
  });

  it("executes an existing runtime query without adding domain logic", () => {
    const revenue = query("commerce.revenue.summary");
    const composition = createCommerceQueryComposition({
      revenue: [revenue],
    });

    const runtime = new Runtime({ tenantId: "tenant-1" });
    runtime.registerQuery(revenue);

    const service = new CommerceDashboardQueryService(runtime, composition);

    expect(service.execute<string, string>("commerce.revenue.summary", "input")).toBe("input");
  });

  it("passes offset and limit into runtime query input", () => {
    const topProduct = query("commerce.product.analytics.top");

    const composition = createCommerceQueryComposition({
      product: [topProduct],
    });

    const runtime = new Runtime({ tenantId: "tenant-1" });
    runtime.registerQuery(topProduct);
    const spy = vi.spyOn(runtime, "query");
    const service = new CommerceDashboardQueryService(runtime, composition);

    service.executePage(
      "commerce.product.analytics.top",
      { category: "shoes" },
      { offset: 20, limit: 10 },
    );

    expect(spy).toHaveBeenCalledWith("commerce.product.analytics.top", {
      category: "shoes",
      offset: 20,
      limit: 10,
    });
  });
});
