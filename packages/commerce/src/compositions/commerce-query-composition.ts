import type { Query } from "@ci/runtime";

export type CommerceQueryDomain =
  | "revenue"
  | "customer"
  | "product"
  | "session"
  | "funnel"
  | "retention";

export interface CommerceQueryGroup {
  readonly domain: CommerceQueryDomain;
  readonly queries: readonly Query[];
}

export interface CommerceQueryCompositionInput {
  readonly revenue?: readonly Query[];
  readonly customer?: readonly Query[];
  readonly product?: readonly Query[];
  readonly session?: readonly Query[];
  readonly funnel?: readonly Query[];
  readonly retention?: readonly Query[];
}

export interface CommerceQueryComposition {
  readonly revenue: readonly Query[];
  readonly customer: readonly Query[];
  readonly product: readonly Query[];
  readonly session: readonly Query[];
  readonly funnel: readonly Query[];
  readonly retention: readonly Query[];
  readonly all: readonly Query[];
  readonly groups: readonly CommerceQueryGroup[];
}

/**
 * Composes already-implemented commerce queries into one immutable read-side
 * catalog. It does not construct query implementations and therefore does not
 * hide application-level query selection.
 */
export function createCommerceQueryComposition(
  input: CommerceQueryCompositionInput = {},
): CommerceQueryComposition {
  const revenue = freezeQueries(input.revenue);
  const customer = freezeQueries(input.customer);
  const product = freezeQueries(input.product);
  const session = freezeQueries(input.session);
  const funnel = freezeQueries(input.funnel);
  const retention = freezeQueries(input.retention);

  const groups = Object.freeze([
    { domain: "revenue", queries: revenue },
    { domain: "customer", queries: customer },
    { domain: "product", queries: product },
    { domain: "session", queries: session },
    { domain: "funnel", queries: funnel },
    { domain: "retention", queries: retention },
  ] satisfies readonly CommerceQueryGroup[]);

  const all = Object.freeze([
    ...revenue,
    ...customer,
    ...product,
    ...session,
    ...funnel,
    ...retention,
  ]);

  assertUniqueQueryNames(all);

  return Object.freeze({
    revenue,
    customer,
    product,
    session,
    funnel,
    retention,
    all,
    groups,
  });
}

function freezeQueries(queries?: readonly Query[]): readonly Query[] {
  return Object.freeze([...(queries ?? [])]);
}

function assertUniqueQueryNames(queries: readonly Query[]): void {
  const names = new Set<string>();

  for (const query of queries) {
    if (names.has(query.name)) {
      throw new Error(`Duplicate commerce query: ${query.name}`);
    }

    names.add(query.name);
  }
}
