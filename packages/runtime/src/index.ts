export type { EventEnvelope } from "./contracts/event.js";

export type {
  Projection,
  ProjectionContext,
} from "./contracts/projection.js";

export type {
  Query,
  QueryContext,
} from "./contracts/query.js";

export type {
  ProjectionSnapshot,
  RuntimeSnapshot,
} from "./contracts/snapshot.js";
export { DuplicateRegistrationError } from "./errors/duplicate-registration-error.js";
export { RuntimeError } from "./errors/runtime-error.js";

export { ProjectionRegistry } from "./registry/projection-registry.js";

export { QueryRegistry } from "./registry/query-registry.js";

export { Runtime } from "./runtime/runtime.js";
