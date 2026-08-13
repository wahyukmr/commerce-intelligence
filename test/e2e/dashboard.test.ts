import { expect, test } from "@playwright/test";

test.describe("Dashboard smoke test", () => {
  test("loads the dashboard", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Get started" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Count is 0" }),
    ).toBeVisible();
  });

  test("counter works", async ({ page }) => {
    await page.goto("/");

    const counter = page.getByRole("button", { name: "Count is 0" });

    await counter.click();

    await expect(
      page.getByRole("button", { name: "Count is 1" }),
    ).toBeVisible();
  });
});
