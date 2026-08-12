import { z } from "zod";

export const sharedSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  DATABASE_URL: z.url(),

  JWT_SECRET: z.string().min(32),

  API_BASE_URL: z.url(),

  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]),
});

export const sharedEnv = sharedSchema.parse(process.env);
