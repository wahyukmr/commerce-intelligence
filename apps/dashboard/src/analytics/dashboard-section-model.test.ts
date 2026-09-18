import { describe, expect, it } from "vitest";

import { DASHBOARD_SECTIONS } from "./dashboard-section-model";

describe("dashboard section model", () => {
  it("defines the locked dashboard information architecture", () => {
    expect(DASHBOARD_SECTIONS.map((section) => section.id)).toEqual([
      "overview",
      "revenue",
      "customers",
      "products",
      "sessions",
      "funnel",
      "retention",
    ]);
  });
});
