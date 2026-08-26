import { e2eEnv } from "@ci/config-env/e2e";
import { defineConfig, devices } from "@playwright/test";

const isCI = e2eEnv.CI;
const externalBaseURL = e2eEnv.BASE_URL;

export default defineConfig({
  testDir: "./e2e",

  forbidOnly: isCI,
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: isCI
    ? [
        [
          "html",
          {
            outputFolder: "playwright-report",
            open: "never",
          },
        ],
        ["github"],
      ]
    : [["list"]],

  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:4173",

    extraHTTPHeaders: e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          "x-vercel-protection-bypass": e2eEnv.VERCEL_AUTOMATION_BYPASS_SECRET,
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
        reuseExistingServer: !isCI,
      },
});
