import type { EventEnvelope, Projection, ProjectionContext } from "@ci/runtime";
import type {
  CustomerRetentionRecord,
  RetentionCohort,
  RetentionProjectionState,
} from "../domain/retention";
import type { OrderPaidPayload } from "../events/commerce-event";
import { COMMERCE_EVENT_TYPES } from "../events/event-types";

type RetentionEvent = EventEnvelope<"order.paid", OrderPaidPayload>;

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getWeekStart(timestamp: string): string {
  const date = new Date(timestamp);

  const day = date.getUTCDay();

  const daysSinceMonday = (day + 6) % 7;

  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  date.setUTCHours(0, 0, 0, 0);

  return date.toISOString();
}

function getWeekOffset(cohortWeek: string, activityWeek: string): number {
  const cohortTime = Date.parse(cohortWeek);

  const activityTime = Date.parse(activityWeek);

  return Math.floor((activityTime - cohortTime) / MILLISECONDS_PER_WEEK);
}

export class RetentionProjection implements Projection<RetentionProjectionState> {
  readonly name = "commerce.retention";

  createInitialState(_context: ProjectionContext): RetentionProjectionState {
    return {
      customers: {},
      cohorts: {},
      customerCount: 0,
    };
  }

  apply(
    state: RetentionProjectionState,
    event: RetentionEvent,
    _context: ProjectionContext,
  ): RetentionProjectionState {
    if (event.type !== COMMERCE_EVENT_TYPES.ORDER_PAID) {
      return state;
    }

    return this.applyOrderPaid(state, event);
  }

  serialize(state: RetentionProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): RetentionProjectionState {
    return snapshot as RetentionProjectionState;
  }

  private applyOrderPaid(
    state: RetentionProjectionState,
    event: RetentionEvent,
  ): RetentionProjectionState {
    const customerId = event.payload.customerId;

    const activityWeek = getWeekStart(event.payload.paidAt);

    const existing = state.customers[customerId];

    if (!existing) {
      const cohortWeek = activityWeek;

      const customer: CustomerRetentionRecord = {
        customerId,
        firstPurchaseAt: event.payload.paidAt,
        cohortWeek,
        activeWeeks: [cohortWeek],
      };

      const existingCohort = state.cohorts[cohortWeek];

      const cohort: RetentionCohort = existingCohort
        ? {
            ...existingCohort,
            customerCount: existingCohort.customerCount + 1,
            activeCustomerCounts: {
              ...existingCohort.activeCustomerCounts,
              0: (existingCohort.activeCustomerCounts[0] ?? 0) + 1,
            },
          }
        : {
            cohortWeek,
            customerCount: 1,
            activeCustomerCounts: {
              0: 1,
            },
          };

      return {
        customers: {
          ...state.customers,
          [customerId]: customer,
        },
        cohorts: {
          ...state.cohorts,
          [cohortWeek]: cohort,
        },
        customerCount: state.customerCount + 1,
      };
    }

    if (existing.activeWeeks.includes(activityWeek)) {
      return state;
    }

    const weekOffset = getWeekOffset(existing.cohortWeek, activityWeek);

    if (weekOffset < 0) {
      return state;
    }

    const updatedCustomer: CustomerRetentionRecord = {
      ...existing,
      activeWeeks: [...existing.activeWeeks, activityWeek].sort(),
    };

    const cohort = state.cohorts[existing.cohortWeek];

    if (!cohort) {
      return state;
    }

    const currentActiveCount = cohort.activeCustomerCounts[weekOffset] ?? 0;

    const updatedCohort: RetentionCohort = {
      ...cohort,
      activeCustomerCounts: {
        ...cohort.activeCustomerCounts,
        [weekOffset]: currentActiveCount + 1,
      },
    };

    return {
      ...state,
      customers: {
        ...state.customers,
        [customerId]: updatedCustomer,
      },
      cohorts: {
        ...state.cohorts,
        [existing.cohortWeek]: updatedCohort,
      },
    };
  }
}
