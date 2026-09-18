import type { CommerceQueryComposition, CommerceQueryDomain } from "@ci/commerce";
import type { Query, Runtime } from "@ci/runtime";

import {
  assertPageRequest,
  type DashboardPage,
  type DashboardPageRequest,
} from "./dashboard-pagination";

export interface DashboardQueryService {
  readonly composition: CommerceQueryComposition;

  list(domain?: CommerceQueryDomain): readonly Query[];

  get(name: string): Query;

  execute<TInput, TResult>(name: string, input: TInput): TResult;

  executePage<TInput, TResult>(name: string, input: TInput, page: DashboardPageRequest): TResult;
}

export class CommerceDashboardQueryService implements DashboardQueryService {
  private readonly runtime: Runtime;
  public readonly composition: CommerceQueryComposition;

  constructor(runtime: Runtime, composition: CommerceQueryComposition) {
    this.runtime = runtime;
    this.composition = composition;
  }

  public list(domain?: CommerceQueryDomain): readonly Query[] {
    if (!domain) {
      return this.composition.all;
    }

    return this.composition[domain];
  }

  public get(name: string): Query {
    const query = this.composition.all.find((candidate) => candidate.name === name);

    if (!query) {
      throw new Error(`Unknown commerce query: ${name}`);
    }

    return query;
  }

  public execute<TInput, TResult>(name: string, input: TInput): TResult {
    this.get(name);

    return this.runtime.query<TInput, TResult>(name, input);
  }

  public executePage<TInput, TResult>(
    name: string,
    input: TInput,
    page: DashboardPageRequest,
  ): TResult {
    assertPageRequest(page.offset, page.limit);

    return this.execute<TInput & DashboardPageRequest, TResult>(name, {
      ...input,
      offset: page.offset,
      limit: page.limit,
    });
  }
}

export function isDashboardPage<TItem>(value: unknown): value is DashboardPage<TItem> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.items) &&
    typeof candidate.total === "number" &&
    typeof candidate.offset === "number" &&
    typeof candidate.limit === "number" &&
    typeof candidate.hasNext === "boolean"
  );
}
