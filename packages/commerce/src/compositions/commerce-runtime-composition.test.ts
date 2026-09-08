import { describe, expect, it } from "vitest";

import { createCommerceRuntimeComposition } from "./commerce-runtime-composition";

const EXPECTED_PROJECTIONS = [
  "commerce.customer",
  "commerce.order",
  "commerce.revenue",
  "commerce.customer.analytics",
  "commerce.product.analytics",
  "commerce.session.analytics",
  "commerce.funnel",
  "commerce.retention",
];

describe("createCommerceRuntimeComposition", () => {
  it("registers the canonical commerce projections", () => {
    const runtime = createCommerceRuntimeComposition({
      tenantId: "tenant-test",
    });

    expect(runtime.projectionNames).toEqual(EXPECTED_PROJECTIONS);
  });

  it("preserves tenant identity", () => {
    const runtime = createCommerceRuntimeComposition({
      tenantId: "tenant-test",
    });

    expect(runtime.tenantId).toBe("tenant-test");
  });

  it("allows query composition without changing projections", () => {
    const query = {
      name: "test.query",
      execute: () => ({ ok: true }),
    };

    const runtime = createCommerceRuntimeComposition({
      tenantId: "tenant-test",
      queries: [query],
    });

    expect(runtime.queryNames).toEqual(["test.query"]);
  });
});
