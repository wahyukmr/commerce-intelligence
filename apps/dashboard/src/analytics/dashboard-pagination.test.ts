import { describe, expect, it } from "vitest";

import {
  assertPageRequest,
  createDashboardPage,
  createDashboardPageRequest,
} from "./dashboard-pagination";

describe("dashboard pagination", () => {
  it("creates the default request", () => {
    expect(createDashboardPageRequest()).toEqual({
      offset: 0,
      limit: 50,
    });
  });

  it("rejects invalid limits", () => {
    expect(() => assertPageRequest(0, 0)).toThrow();
    expect(() => assertPageRequest(0, 501)).toThrow();
  });

  it("creates a page with hasNext metadata", () => {
    const request = createDashboardPageRequest(10, 10);
    const page = createDashboardPage(["a", "b"], 25, request);

    expect(page).toEqual({
      items: ["a", "b"],
      total: 25,
      offset: 10,
      limit: 10,
      hasNext: true,
    });
  });

  it("marks the final page correctly", () => {
    const request = createDashboardPageRequest(20, 10);
    const page = createDashboardPage(["a", "b"], 22, request);

    expect(page.hasNext).toBe(false);
  });
});
