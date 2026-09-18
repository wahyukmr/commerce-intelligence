export type DashboardViewState<T> =
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "empty" }
  | { readonly status: "error"; readonly error: Error };

export function toDashboardViewState<T>(
  data: T,
  isEmpty: (data: T) => boolean,
): DashboardViewState<T> {
  return isEmpty(data) ? { status: "empty" } : { status: "success", data };
}

export function toDashboardErrorState(error: unknown): DashboardViewState<never> {
  return {
    status: "error",
    error: error instanceof Error ? error : new Error(String(error)),
  };
}
