import type { SeededRandom } from "../random/seeded-random";
import type { Timeline } from "../timeline/timeline";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export interface SessionEventClock {
  sessionStartedAt: number;
  productViewedAt: readonly number[];
  cartItemAddedAt: readonly number[];
  checkoutStartedAt?: number;
  orderPlacedAt?: number;
  orderPaidAt?: number;
  orderCancelledAt?: number;
  refundIssuedAt?: number;
}

export class SimulationCausalClock {
  public constructor(
    private readonly timeline: Timeline,
    private readonly random: SeededRandom,
  ) {}

  public createSession(baseOffsetMs: number): SessionEventClock {
    const sessionStartedAt = Date.parse(this.timeline.atOffset(baseOffsetMs));

    const productViewedAt: number[] = [];

    return {
      sessionStartedAt,
      productViewedAt,
      cartItemAddedAt: [],
      ...this.buildBase(),
    };
  }

  public advance(current: number, minSeconds: number, maxSeconds: number): number {
    const next = current + this.random.integer(minSeconds, maxSeconds) * SECOND_MS;

    return Math.min(next, Date.parse(this.timeline.endAt));
  }

  public createSequence(startAt: number, count: number): readonly number[] {
    const timestamps: number[] = [];
    let cursor = startAt;

    for (let index = 0; index < count; index += 1) {
      cursor = this.advance(cursor, 2, 45);
      timestamps.push(cursor);
    }

    return timestamps;
  }

  public checkout(startAt: number): number {
    return this.advance(startAt, 15, 120);
  }

  public orderPlaced(startAt: number): number {
    return this.advance(startAt, 30, 180);
  }

  public orderPaid(startAt: number): number {
    return this.advance(startAt, 30, 300);
  }

  public orderCancelled(startAt: number): number {
    return this.advance(startAt, (5 * MINUTE_MS) / SECOND_MS, 24 * 60 * 60);
  }

  public refundIssued(startAt: number): number {
    return this.advance(startAt, 60, 7 * 24 * 60 * 60);
  }

  private buildBase() {
    return {
      checkoutStartedAt: undefined,
      orderPlacedAt: undefined,
      orderPaidAt: undefined,
      orderCancelledAt: undefined,
      refundIssuedAt: undefined,
    };
  }
}
