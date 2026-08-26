import { z } from "zod";
import { sharedSchema } from "./shared.js";

const serverSchema = sharedSchema.extend({
  DATABASE_URL: z.url(),

  JWT_SECRET: z.string().min(32),

  API_BASE_URL: z.url(),
});

export const serverEnv = serverSchema.parse(process.env);
