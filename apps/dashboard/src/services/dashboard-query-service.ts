import type { CommerceQueryComposition, CommerceQueryDomain } from "@ci/commerce";
import type { Query, QueryContext, Runtime } from "@ci/runtime";

export interface DashboardQueryService {
  readonly composition: CommerceQueryComposition;
  list(domain?: CommerceQueryDomain): readonly Query[];
  get(name: string): Query;
  execute<TInput, TResult>(name: string, input: TInput, context?: QueryContext): TResult;
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
}
