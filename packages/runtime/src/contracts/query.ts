import type { RuntimeSnapshot } from "./snapshot";

export interface QueryContext {
  readonly tenantId: string;
}

export interface Query<TInput = unknown, TResult = unknown> {
  readonly name: string;

  execute(snapshot: RuntimeSnapshot, input: TInput, context: QueryContext): TResult;
}
