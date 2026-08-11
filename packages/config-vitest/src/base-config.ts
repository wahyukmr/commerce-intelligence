import { defineConfig, type ViteUserConfig } from "vitest/config";
import { TEST_EXCLUDE, TEST_INCLUDE } from "./constant.js";

export const baseConfig: ViteUserConfig = defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: TEST_INCLUDE,
    exclude: TEST_EXCLUDE,
    reporters: ["default"],
  },
});
