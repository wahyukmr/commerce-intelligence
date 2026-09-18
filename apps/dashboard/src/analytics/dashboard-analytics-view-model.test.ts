import { describe, expect, it } from "vitest";

import { createDashboardAnalyticsViewModel } from "./dashboard-analytics-view-model";

describe("dashboard analytics view model", () => {
  it("keeps query result state presentation-agnostic", () => {
    expect(
      createDashboardAnalyticsViewModel("revenue", {
        status: "success",
        data: { total: 123 },
      }),
    ).toEqual({
      section: "revenue",
      state: {
        status: "success",
        data: { total: 123 },
      },
    });
  });
});
