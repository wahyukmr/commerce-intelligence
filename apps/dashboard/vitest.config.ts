import { webConfig } from "@ci/config-vitest";
import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  webConfig,
  defineConfig({
    plugins: [react()],
  }),
);
