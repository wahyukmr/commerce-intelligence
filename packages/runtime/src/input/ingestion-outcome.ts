export type IngestionOutcomeStatus = "accepted" | "duplicate";

export interface IngestionOutcome {
  readonly status: IngestionOutcomeStatus;
  readonly eventId: string;
  readonly tenantId: string;
  readonly receivedAt: string;
}

export function createIngestionOutcome(
  status: IngestionOutcomeStatus,
  event: { readonly id: string; readonly tenantId: string },
  receivedAt = new Date().toISOString(),
): IngestionOutcome {
  return {
    status,
    eventId: event.id,
    tenantId: event.tenantId,
    receivedAt,
  };
}
