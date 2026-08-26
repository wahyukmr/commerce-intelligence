import { z } from "zod";

const e2eSchema = z.object({
  BASE_URL: z.url().optional(),

  VERCEL_AUTOMATION_BYPASS_SECRET: z.string().min(1).optional(),

  CI: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false),
});

export const e2eEnv = e2eSchema.parse(process.env);
