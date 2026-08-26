import { z } from "zod";

export const sharedSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]),
});

export const sharedEnv = sharedSchema.parse(process.env);
