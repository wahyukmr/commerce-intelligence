import { describe, expect, it } from "vitest";

import { createCommerceQueryComposition } from "./commerce-query-composition";

function query(name: string) {
  return {
    name,
    execute: () => ({ ok: true }),
  };
}

describe("createCommerceQueryComposition", () => {
  it("preserves domain grouping and a canonical all list", () => {
    const revenue = [query("commerce.revenue.summary")];
    const customer = [query("commerce.customer.summary")];
    const funnel = [query("commerce.funnel.summary")];

    const composition = createCommerceQueryComposition({
      revenue,
      customer,
      funnel,
    });

    expect(composition.revenue).toHaveLength(1);
    expect(composition.customer).toHaveLength(1);
    expect(composition.funnel).toHaveLength(1);
    expect(composition.all.map((item) => item.name)).toEqual([
      "commerce.revenue.summary",
      "commerce.customer.summary",
      "commerce.funnel.summary",
    ]);
  });

  it("rejects duplicate query names", () => {
    expect(() =>
      createCommerceQueryComposition({
        revenue: [query("commerce.revenue.summary")],
        customer: [query("commerce.revenue.summary")],
      }),
    ).toThrow("Duplicate commerce query: commerce.revenue.summary");
  });

  it("does not mutate caller arrays", () => {
    const source = [query("commerce.revenue.summary")];
    const composition = createCommerceQueryComposition({
      revenue: source,
    });

    expect(composition.revenue).not.toBe(source);
    expect(Object.isFrozen(composition.revenue)).toBe(true);
    expect(Object.isFrozen(composition)).toBe(true);
  });
});
