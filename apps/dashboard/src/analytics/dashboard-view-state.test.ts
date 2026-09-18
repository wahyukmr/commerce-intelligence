import { describe, expect, it } from "vitest";

import { toDashboardErrorState, toDashboardViewState } from "./dashboard-view-state";

describe("dashboard view state", () => {
  it("creates success state", () => {
    expect(toDashboardViewState({ value: 1 }, () => false)).toEqual({
      status: "success",
      data: { value: 1 },
    });
  });

  it("creates empty state", () => {
    expect(toDashboardViewState([], (data) => data.length === 0)).toEqual({
      status: "empty",
    });
  });

  it("normalizes errors", () => {
    const result = toDashboardErrorState("failed");
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.error.message).toBe("failed");
  });
});
