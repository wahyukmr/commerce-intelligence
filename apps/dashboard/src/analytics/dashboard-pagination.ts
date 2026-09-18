export interface DashboardPageRequest {
  readonly offset: number;
  readonly limit: number;
}

export interface DashboardPage<TItem> {
  readonly items: readonly TItem[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

export function createDashboardPageRequest(offset = 0, limit = 50): DashboardPageRequest {
  assertPageRequest(offset, limit);

  return Object.freeze({ offset, limit });
}

export function assertPageRequest(offset: number, limit: number): void {
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("Dashboard page offset must be a non-negative integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error("Dashboard page limit must be an integer between 1 and 500.");
  }
}

export function createDashboardPage<TItem>(
  items: readonly TItem[],
  total: number,
  request: DashboardPageRequest,
): DashboardPage<TItem> {
  assertPageRequest(request.offset, request.limit);

  if (!Number.isInteger(total) || total < 0) {
    throw new Error("Dashboard page total must be a non-negative integer.");
  }

  const frozenItems = Object.freeze([...items]);

  return Object.freeze({
    items: frozenItems,
    total,
    offset: request.offset,
    limit: request.limit,
    hasNext: request.offset + frozenItems.length < total,
  });
}
