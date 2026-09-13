import type { RuntimeSnapshot } from "../contracts/snapshot";

export interface RecoveryState {
  readonly tenantId: string;
  readonly sequence: number;
  readonly snapshot: RuntimeSnapshot;
  readonly updatedAt: string;
}

export interface RecoveryStateStore {
  load(tenantId: string): Promise<RecoveryState | null>;
  save(state: RecoveryState): Promise<void>;
  clear(tenantId: string): Promise<void>;
}

export class InMemoryRecoveryStateStore implements RecoveryStateStore {
  private readonly states = new Map<string, RecoveryState>();

  public async load(tenantId: string): Promise<RecoveryState | null> {
    return this.states.get(tenantId) ?? null;
  }

  public async save(state: RecoveryState): Promise<void> {
    this.states.set(state.tenantId, structuredClone(state));
  }

  public async clear(tenantId: string): Promise<void> {
    this.states.delete(tenantId);
  }
}
