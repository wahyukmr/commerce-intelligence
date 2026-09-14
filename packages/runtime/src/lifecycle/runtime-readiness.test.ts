import { describe, expect, it } from "vitest";

import { RuntimeNotReadyError, RuntimeReadiness } from "./runtime-readiness.js";

describe("RuntimeReadiness", () => {
  it("starts in recovering state", () => {
    const readiness = new RuntimeReadiness();

    expect(readiness.current).toBe("recovering");
    expect(readiness.isReady).toBe(false);
    expect(() => readiness.assertReady()).toThrow(RuntimeNotReadyError);
  });

  it("becomes ready after recovery completes", () => {
    const readiness = new RuntimeReadiness();

    readiness.markReady();

    expect(readiness.current).toBe("ready");
    expect(readiness.isReady).toBe(true);
    expect(() => readiness.assertReady()).not.toThrow();
  });

  it("can return to recovering state", () => {
    const readiness = new RuntimeReadiness();

    readiness.markReady();
    readiness.beginRecovery();

    expect(readiness.isReady).toBe(false);
  });
});
