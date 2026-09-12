import { describe, expect, it } from "vitest";

import { SeededRandom } from "./seeded-random";

describe("SeededRandom", () => {
  it("produces deterministic sequences", () => {
    const first = new SeededRandom(42);

    const second = new SeededRandom(42);

    const firstValues = Array.from({ length: 10 }, () => first.next());

    const secondValues = Array.from({ length: 10 }, () => second.next());

    expect(firstValues).toEqual(secondValues);
  });

  it("produces different sequences for different seeds", () => {
    const first = new SeededRandom(42);

    const second = new SeededRandom(43);

    expect(first.next()).not.toBe(second.next());
  });

  it("produces integers inside the requested range", () => {
    const random = new SeededRandom(123);

    for (let index = 0; index < 100; index += 1) {
      const value = random.integer(10, 20);

      expect(value).toBeGreaterThanOrEqual(10);

      expect(value).toBeLessThanOrEqual(20);
    }
  });

  it("picks from a collection", () => {
    const random = new SeededRandom(123);

    const values = ["a", "b", "c"];

    expect(values).toContain(random.pick(values));
  });

  it("performs weighted selection", () => {
    const random = new SeededRandom(123);

    const selected = random.weighted([
      {
        value: "low",
        weight: 1,
      },
      {
        value: "high",
        weight: 99,
      },
    ]);

    expect(["low", "high"]).toContain(selected);
  });

  it("rejects invalid probability", () => {
    const random = new SeededRandom(1);

    expect(() => random.boolean(2)).toThrow("Probability must be between 0 and 1.");
  });

  it("rejects invalid weighted collections", () => {
    const random = new SeededRandom(1);

    expect(() =>
      random.weighted([
        {
          value: "invalid",
          weight: 0,
        },
      ]),
    ).toThrow("Total weight must be greater than zero.");
  });
});
