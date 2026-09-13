export type { EventEnvelope } from "./contracts/event";

export type {
  Projection,
  ProjectionContext,
} from "./contracts/projection";

export type {
  Query,
  QueryContext,
} from "./contracts/query";

export type {
  ProjectionSnapshot,
  RuntimeSnapshot,
} from "./contracts/snapshot";
export { DuplicateRegistrationError } from "./errors/duplicate-registration-error";
export { RuntimeError } from "./errors/runtime-error";
export * from "./events";
export * from "./input";
export * from "./lifecycle";
export * from "./observability";
export * from "./recovery";
export { ProjectionRegistry } from "./registry/projection-registry";
export { QueryRegistry } from "./registry/query-registry";
export { Runtime } from "./runtime/runtime";
export * from "./security";
export * from "./testing/adapter-contract";
