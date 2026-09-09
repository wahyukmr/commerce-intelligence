export class SimulationIdFactory {
  private sequence = 0;
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  next(): string {
    this.sequence += 1;

    return `${this.prefix}-${this.sequence.toString(36)}`;
  }

  get count(): number {
    return this.sequence;
  }
}
