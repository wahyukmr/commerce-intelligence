import { expect, test } from "@playwright/test";

test.describe("Dashboard smoke test", () => {
  test("loads the dashboard", async ({ page }) => {
    await page.goto("/");

    console.log("URL:", page.url());
    console.log("TITLE:", await page.title());

    await page.screenshot({
      path: "test-results/dashboard.png",
      fullPage: true,
    });

    await expect(
      page.getByRole("heading", { name: "THIS MUST NOT EXIST" }),
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
