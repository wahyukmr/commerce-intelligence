import type { Query } from "../contracts/query.js";
import { DuplicateRegistrationError } from "../errors/duplicate-registration-error.js";

export class QueryRegistry {
  private readonly queries = new Map<string, Query<unknown, unknown>>();

  register(query: Query<unknown, unknown>): void {
    if (this.queries.has(query.name)) {
      throw new DuplicateRegistrationError("query", query.name);
    }

    this.queries.set(query.name, query);
  }

  has(name: string): boolean {
    return this.queries.has(name);
  }

  get(name: string): Query<unknown, unknown> {
    const query = this.queries.get(name);

    if (!query) {
      throw new Error(`Query "${name}" is not registered.`);
    }

    return query;
  }

  list(): readonly string[] {
    return [...this.queries.keys()];
  }
}
