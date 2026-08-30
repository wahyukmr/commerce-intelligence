import type { Projection } from "../contracts/projection.js";
import { DuplicateRegistrationError } from "../errors/duplicate-registration-error.js";

export class ProjectionRegistry {
  private readonly projections = new Map<string, Projection<unknown>>();

  register(projection: Projection<unknown>): void {
    if (this.projections.has(projection.name)) {
      throw new DuplicateRegistrationError("projection", projection.name);
    }

    this.projections.set(projection.name, projection);
  }

  has(name: string): boolean {
    return this.projections.has(name);
  }

  get(name: string): Projection<unknown> {
    const projection = this.projections.get(name);

    if (!projection) {
      throw new Error(`Projection "${name}" is not registered.`);
    }

    return projection;
  }

  list(): readonly string[] {
    return [...this.projections.keys()];
  }

  values(): readonly Projection<unknown>[] {
    return [...this.projections.values()];
  }
}
