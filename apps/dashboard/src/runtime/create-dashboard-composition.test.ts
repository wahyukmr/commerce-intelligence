import type { Query } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import { createDashboardComposition } from "./create-dashboard-composition";

function query(name: string): Query {
  return {
    name,
    execute() {
      return { ok: true };
    },
  } as Query;
}

describe("createDashboardComposition", () => {
  it("builds one canonical runtime, query composition, and query service", () => {
    const revenue = query("commerce.revenue.summary");
    const customer = query("commerce.customer.summary");

    const composition = createDashboardComposition({
      tenantId: "tenant-a",
      queries: {
        revenue: [revenue],
        customer: [customer],
      },
    });

    expect(composition.queryComposition.revenue).toEqual([revenue]);
    expect(composition.queryComposition.customer).toEqual([customer]);
    expect(composition.queryComposition.all).toEqual([revenue, customer]);
    expect(composition.queryService.list()).toEqual([revenue, customer]);
    expect(composition.runtime).toBeDefined();
  });

  it("registers every composed query with the runtime", () => {
    const summary = query("commerce.revenue.summary");

    const composition = createDashboardComposition({
      tenantId: "tenant-a",
      queries: { revenue: [summary] },
    });

    expect(() => composition.runtime.query("commerce.revenue.summary", {})).not.toThrow();
  });

  it("does not infer query domains from query names", () => {
    const customName = query("commerce.revenue.custom");

    const composition = createDashboardComposition({
      tenantId: "tenant-a",
      queries: { revenue: [customName] },
    });

    expect(composition.queryComposition.revenue).toEqual([customName]);
    expect(composition.queryComposition.customer).toEqual([]);
  });

  it("rejects duplicate query names at the composition boundary", () => {
    const first = query("commerce.revenue.summary");
    const second = query("commerce.revenue.summary");

    expect(() =>
      createDashboardComposition({
        tenantId: "tenant-a",
        queries: { revenue: [first, second] },
      }),
    ).toThrow(/Duplicate commerce query/);
  });
});
