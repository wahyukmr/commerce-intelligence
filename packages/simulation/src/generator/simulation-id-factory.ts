export class SimulationIdFactory {
  private sequence = 0;

  constructor(private readonly prefix: string) {}

  next(): string {
    this.sequence += 1;

    return `${this.prefix}-${this.sequence.toString(36)}`;
  }

  get count(): number {
    return this.sequence;
  }
}
