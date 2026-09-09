export class SeededRandom {
  private static readonly DEFAULT_BOOLEAN_PROBABILITY = 0.5;
  private static readonly UINT32_RANGE = 4_294_967_296;
  private static readonly FIRST_SHIFT = 13;
  private static readonly SECOND_SHIFT = 17;
  private static readonly THIRD_SHIFT = 5;

  private state: number;

  constructor(seed: number) {
    if (!Number.isSafeInteger(seed)) {
      throw new Error("Seed must be a safe integer.");
    }

    this.state = seed >>> 0;
  }

  next(): number {
    let value = this.state;

    value ^= value << SeededRandom.FIRST_SHIFT;
    value ^= value >>> SeededRandom.SECOND_SHIFT;
    value ^= value << SeededRandom.THIRD_SHIFT;

    this.state = value >>> 0;

    return this.state / SeededRandom.UINT32_RANGE;
  }

  integer(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("Random integer bounds must be integers.");
    }

    if (min > max) {
      throw new Error("Random integer minimum cannot exceed maximum.");
    }

    return min + Math.floor(this.next() * (max - min + 1));
  }

  boolean(probability = SeededRandom.DEFAULT_BOOLEAN_PROBABILITY): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error("Probability must be between 0 and 1.");
    }

    return this.next() < probability;
  }

  pick<T>(values: readonly T[]): T {
    if (values.length === 0) {
      throw new Error("Cannot pick from an empty collection.");
    }

    return values[this.integer(0, values.length - 1)] as T;
  }

  weighted<T>(
    values: readonly {
      readonly value: T;
      readonly weight: number;
    }[],
  ): T {
    if (values.length === 0) {
      throw new Error("Cannot perform weighted selection on an empty collection.");
    }

    let totalWeight = 0;

    for (const item of values) {
      if (!Number.isFinite(item.weight) || item.weight < 0) {
        throw new Error("Weights must be finite non-negative numbers.");
      }

      totalWeight += item.weight;
    }

    if (totalWeight <= 0) {
      throw new Error("Total weight must be greater than zero.");
    }

    let threshold = this.next() * totalWeight;

    for (const item of values) {
      threshold -= item.weight;

      if (threshold <= 0) {
        return item.value;
      }
    }

    const lastItem = values[values.length - 1];

    if (lastItem === undefined) {
      throw new Error("Cannot perform weighted selection on an empty collection.");
    }

    return lastItem.value;
  }
}
