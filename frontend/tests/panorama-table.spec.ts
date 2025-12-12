import { test, expect } from "@playwright/test";
import { mockPanoramaApi } from "./setup/mockApi";

test("can search panoramas", async ({ page }) => {
  await mockPanoramaApi(page);
  await page.goto("/images");

  await page.getByTestId("search-input").fill("kitchen");
  await page.waitForTimeout(200);

  expect(await page.getByTestId("panorama-table").count()).toBeGreaterThan(0);
});

test("can toggle bookmark filter", async ({ page }) => {
  await mockPanoramaApi(page);
  await page.goto("/images");

  await page.getByTestId("bookmark-switch").click();
  await page.waitForTimeout(200);

  expect(await page.getByTestId("panorama-table").count()).toBeGreaterThan(0);
});
