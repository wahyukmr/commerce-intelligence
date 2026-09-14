export type RuntimeReadinessState = "recovering" | "ready";

export class RuntimeNotReadyError extends Error {
  constructor() {
    super("Runtime is not ready to accept events");
    this.name = "RuntimeNotReadyError";
  }
}

export class RuntimeReadiness {
  private state: RuntimeReadinessState = "recovering";

  public get current(): RuntimeReadinessState {
    return this.state;
  }

  public get isReady(): boolean {
    return this.state === "ready";
  }

  public beginRecovery(): void {
    this.state = "recovering";
  }

  public markReady(): void {
    this.state = "ready";
  }

  public assertReady(): void {
    if (!this.isReady) {
      throw new RuntimeNotReadyError();
    }
  }
}
