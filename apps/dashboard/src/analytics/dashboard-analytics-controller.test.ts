import { describe, expect, it, vi } from "vitest";

import { DefaultDashboardAnalyticsController } from "./dashboard-analytics-controller";
import { defineDashboardPagedQueryRef } from "./dashboard-paged-query-ref";
import { defineDashboardQueryRef } from "./dashboard-query-ref";

const page = { offset: 0, limit: 25 };

describe("DefaultDashboardAnalyticsController", () => {
  it("executes typed queries", () => {
    const queryService = {
      execute: vi.fn(() => ({ value: 42 })),
      executePage: vi.fn(),
    };

    const controller = new DefaultDashboardAnalyticsController(queryService as never);
    const query = defineDashboardQueryRef<{ range: string }, { value: number }>(
      "commerce.revenue.summary",
    );

    expect(controller.execute(query, { range: "30d" })).toEqual({ value: 42 });
    expect(queryService.execute).toHaveBeenCalledWith("commerce.revenue.summary", { range: "30d" });
  });

  it("executes typed paged queries", () => {
    const queryService = {
      execute: vi.fn(),
      executePage: vi.fn(() => ({
        items: [],
        total: 0,
        offset: 0,
        limit: 25,
        hasNext: false,
      })),
    };

    const controller = new DefaultDashboardAnalyticsController(queryService as never);
    const query = defineDashboardPagedQueryRef<
      { category?: string },
      { items: readonly unknown[]; total: number; offset: number; limit: number; hasNext: boolean }
    >("commerce.product.analytics.top");

    expect(controller.executePage(query, {}, page)).toEqual({
      items: [],
      total: 0,
      offset: 0,
      limit: 25,
      hasNext: false,
    });
    expect(queryService.executePage).toHaveBeenCalledWith(
      "commerce.product.analytics.top",
      {},
      page,
    );
  });
});
