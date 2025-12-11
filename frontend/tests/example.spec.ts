import { test, expect } from "@playwright/test";

test("homepage should load correctly", async ({ page }) => {
  await page.goto("/");

  const root = page.locator("#root");
  await expect(root).toBeVisible();

  await expect(page.getByText("AirGo3D")).toBeVisible();
});
