import { RuntimeError } from "./runtime-error.js";

export class DuplicateRegistrationError extends RuntimeError {
  constructor(kind: "projection" | "query", name: string) {
    super("DUPLICATE_REGISTRATION", `A ${kind} named "${name}" has already been registered.`);

    this.name = "DuplicateRegistrationError";
  }
}
