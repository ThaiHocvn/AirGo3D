import { test, expect } from "@playwright/test";

test("dashboard loads correctly", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("dashboard-card-total-uploaded")).toBeVisible();
  await expect(
    page.getByTestId("dashboard-card-total-bookmarked")
  ).toBeVisible();
  await expect(page.getByTestId("chart-card")).toBeVisible();
});
