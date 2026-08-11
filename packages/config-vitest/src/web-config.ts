import { defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";
import { baseConfig } from "./base-config.js";

export const webConfig: ViteUserConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: "jsdom",
    },
  }),
);
