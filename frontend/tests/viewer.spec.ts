import { test, expect } from "@playwright/test";
import { mockPanoramaApi } from "./setup/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPanoramaApi(page);
});

test("open panorama viewer", async ({ page }) => {
  await page.goto("/images");

  await page.getByTestId("preview-img").first().click();

  await expect(page.getByTestId("panorama-viewer")).toBeVisible();
});
