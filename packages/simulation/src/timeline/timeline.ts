export class Timeline {
  private static readonly MILLISECONDS_PER_SECOND = 1_000;
  private static readonly SECONDS_PER_MINUTE = 60;
  private static readonly MINUTES_PER_HOUR = 60;
  private static readonly HOURS_PER_DAY = 24;

  private static readonly MILLISECONDS_PER_MINUTE =
    Timeline.MILLISECONDS_PER_SECOND * Timeline.SECONDS_PER_MINUTE;

  private static readonly MILLISECONDS_PER_HOUR =
    Timeline.MILLISECONDS_PER_MINUTE * Timeline.MINUTES_PER_HOUR;

  private static readonly MILLISECONDS_PER_DAY =
    Timeline.MILLISECONDS_PER_HOUR * Timeline.HOURS_PER_DAY;

  private readonly startTimeMs: number;

  private readonly durationMs: number;

  constructor(startAt: string, days: number) {
    const startTime = Date.parse(startAt);

    if (Number.isNaN(startTime)) {
      throw new Error("Timeline startAt must be a valid timestamp.");
    }

    if (!Number.isInteger(days) || days <= 0) {
      throw new Error("Timeline days must be a positive integer.");
    }

    this.startTimeMs = startTime;

    this.durationMs = days * Timeline.MILLISECONDS_PER_DAY;
  }

  atOffset(offsetMs: number): string {
    if (Number.isNaN(offsetMs)) {
      throw new Error("Timeline offset must be a number.");
    }

    const clamped = Math.min(Math.max(offsetMs, 0), this.durationMs);

    return new Date(this.startTimeMs + clamped).toISOString();
  }

  atDayOffset(days: number, hour = 0, minute = 0): string {
    const offset =
      days * Timeline.MILLISECONDS_PER_DAY +
      hour * Timeline.MILLISECONDS_PER_HOUR +
      minute * Timeline.MILLISECONDS_PER_MINUTE;

    return this.atOffset(offset);
  }

  randomOffset(random: { next(): number }): number {
    return random.next() * this.durationMs;
  }

  randomDate(random: { next(): number }): string {
    return this.atOffset(this.randomOffset(random));
  }

  get startAt(): string {
    return new Date(this.startTimeMs).toISOString();
  }

  get endAt(): string {
    return new Date(this.startTimeMs + this.durationMs).toISOString();
  }

  get days(): number {
    return this.durationMs / Timeline.MILLISECONDS_PER_DAY;
  }
}
