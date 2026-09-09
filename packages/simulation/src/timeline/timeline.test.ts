import { describe, expect, it } from "vitest";

import { Timeline } from "./timeline.js";

describe("Timeline", () => {
  it("creates a fixed simulation range", () => {
    const timeline = new Timeline("2026-09-01T00:00:00.000Z", 7);

    expect(timeline.startAt).toBe("2026-09-01T00:00:00.000Z");

    expect(timeline.endAt).toBe("2026-09-08T00:00:00.000Z");

    expect(timeline.days).toBe(7);
  });

  it("creates timestamps using day offsets", () => {
    const timeline = new Timeline("2026-09-01T00:00:00.000Z", 7);

    expect(timeline.atDayOffset(2, 10, 30)).toBe("2026-09-03T10:30:00.000Z");
  });

  it("clamps timestamps to the timeline range", () => {
    const timeline = new Timeline("2026-09-01T00:00:00.000Z", 7);

    expect(timeline.atOffset(-1)).toBe("2026-09-01T00:00:00.000Z");

    expect(timeline.atOffset(Number.POSITIVE_INFINITY)).toBe("2026-09-08T00:00:00.000Z");
  });

  it("produces deterministic dates with deterministic randomness", () => {
    const timeline = new Timeline("2026-09-01T00:00:00.000Z", 7);

    const first = {
      next: () => 0.25,
    };

    const second = {
      next: () => 0.25,
    };

    expect(timeline.randomDate(first)).toBe(timeline.randomDate(second));
  });
});
