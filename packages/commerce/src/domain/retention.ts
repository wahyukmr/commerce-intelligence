export interface CustomerRetentionRecord {
  readonly customerId: string;
  readonly firstPurchaseAt: string;
  readonly cohortWeek: string;
  readonly activeWeeks: readonly string[];
}

export interface RetentionCohort {
  readonly cohortWeek: string;
  readonly customerCount: number;
  readonly activeCustomerCounts: Readonly<Record<number, number>>;
}

export interface RetentionProjectionState {
  readonly customers: Readonly<Record<string, CustomerRetentionRecord>>;
  readonly cohorts: Readonly<Record<string, RetentionCohort>>;
  readonly customerCount: number;
}
