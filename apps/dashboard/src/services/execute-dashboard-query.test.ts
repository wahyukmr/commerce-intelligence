import { describe, expect, it, vi } from "vitest";

import { defineDashboardQueryRef } from "./dashboard-query-ref";
import { executeDashboardQuery } from "./execute-dashboard-query";

describe("executeDashboardQuery", () => {
  it("executes through a typed query reference", () => {
    const execute = vi.fn().mockReturnValue({ total: 42 });
    const service = { execute } as never;
    const ref = defineDashboardQueryRef<{ from: string; to: string }, { total: number }>(
      "commerce.revenue.summary",
    );

    const result = executeDashboardQuery(service, ref, {
      from: "2026-01-01",
      to: "2026-01-31",
    });

    expect(result).toEqual({ total: 42 });
    expect(execute).toHaveBeenCalledWith("commerce.revenue.summary", {
      from: "2026-01-01",
      to: "2026-01-31",
    });
  });
});
