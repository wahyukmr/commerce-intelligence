import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.BASE_URL;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./test/e2e",

  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [["html"], ["list"]],

  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:4173",

    extraHTTPHeaders: bypassSecret
      ? {
          "x-vercel-protection-bypass": bypassSecret,
          "x-vercel-set-bypass-cookie": "samesitenone",
        }
      : undefined,

    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: externalBaseURL
    ? undefined
    : {
        command:
          "pnpm exec turbo run build --filter=dashboard && pnpm --filter=dashboard preview --host 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
      },
});
