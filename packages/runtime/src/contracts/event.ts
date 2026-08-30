export interface EventEnvelope<TType extends string = string, TPayload = unknown> {
  readonly id: string;
  readonly type: TType;
  readonly version: number;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly payload: TPayload;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
