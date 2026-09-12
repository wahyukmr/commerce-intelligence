import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";
import type { RetentionCohort, RetentionProjectionState } from "../domain/retention";

export interface RetentionQueryInput {
  readonly cohortWeek?: string;
}

export interface RetentionPeriod {
  readonly week: number;
  readonly activeCustomerCount: number;
  readonly retentionRate: number;
}

export interface RetentionCohortResult {
  readonly cohortWeek: string;
  readonly customerCount: number;
  readonly periods: readonly RetentionPeriod[];
}

export interface RetentionSummary {
  readonly cohortCount: number;
  readonly customerCount: number;
  readonly cohorts: readonly RetentionCohortResult[];
}

function getRetentionState(snapshot: RuntimeSnapshot): RetentionProjectionState {
  const projection = snapshot.projections.find((item) => item.name === "commerce.retention");

  if (!projection) {
    throw new Error('Required projection "commerce.retention" is not available.');
  }

  return projection.state as RetentionProjectionState;
}

function toResult(cohort: RetentionCohort): RetentionCohortResult {
  const periods = Object.entries(cohort.activeCustomerCounts)
    .map(([week, activeCustomerCount]) => {
      const weekNumber = Number(week);

      return {
        week: weekNumber,
        activeCustomerCount,
        retentionRate: cohort.customerCount === 0 ? 0 : activeCustomerCount / cohort.customerCount,
      };
    })
    .sort((left, right) => left.week - right.week);

  return {
    cohortWeek: cohort.cohortWeek,
    customerCount: cohort.customerCount,
    periods,
  };
}

export class RetentionCohortQuery
  implements Query<RetentionQueryInput | undefined, RetentionCohortResult | null>
{
  readonly name = "commerce.retention.cohort";

  execute(
    snapshot: RuntimeSnapshot,
    input: RetentionQueryInput | undefined,
    _context: QueryContext,
  ): RetentionCohortResult | null {
    const state = getRetentionState(snapshot);

    if (!input?.cohortWeek) {
      return null;
    }

    const cohort = state.cohorts[input.cohortWeek];

    if (!cohort) {
      return null;
    }

    return toResult(cohort);
  }
}

export class RetentionSummaryQuery implements Query<undefined, RetentionSummary> {
  readonly name = "commerce.retention.summary";

  execute(snapshot: RuntimeSnapshot, _input: undefined, _context: QueryContext): RetentionSummary {
    const state = getRetentionState(snapshot);

    const cohorts = Object.values(state.cohorts)
      .sort((left, right) => left.cohortWeek.localeCompare(right.cohortWeek))
      .map(toResult);

    return {
      cohortCount: cohorts.length,
      customerCount: state.customerCount,
      cohorts,
    };
  }
}
