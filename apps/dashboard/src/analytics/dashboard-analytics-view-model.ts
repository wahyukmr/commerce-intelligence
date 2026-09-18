import type { DashboardViewState } from "./dashboard-view-state";

export interface DashboardMetric<T> {
  readonly label: string;
  readonly value: T;
}

export interface DashboardAnalyticsViewModel<TData> {
  readonly section: string;
  readonly state: DashboardViewState<TData>;
}

export function createDashboardAnalyticsViewModel<TData>(
  section: string,
  state: DashboardViewState<TData>,
): DashboardAnalyticsViewModel<TData> {
  if (section.trim().length === 0) {
    throw new Error("Dashboard section must be non-empty.");
  }

  return Object.freeze({ section, state });
}
