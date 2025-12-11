import { test, expect } from "@playwright/test";

test.describe("Panorama List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display panorama list page", async ({ page }) => {
    await expect(page.locator("text=AirGo3D")).toBeVisible();
    await expect(page.locator("text=Panorama List")).toBeVisible();
  });

  test("should have search input", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search name"]');
    await expect(searchInput).toBeVisible();
  });

  test("should have upload button", async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload Panorama")');
    await expect(uploadButton).toBeVisible();
  });

  test("should have bookmark filter dropdown", async ({ page }) => {
    const filterSelect = page.locator('[role="combobox"]').first();
    await expect(filterSelect).toBeVisible();
  });

  test("should open upload modal when clicking upload button", async ({
    page,
  }) => {
    const uploadButton = page.locator('button:has-text("Upload Panorama")');
    await uploadButton.click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    await expect(page.locator("text=Upload Panorama")).toBeVisible();
  });

  test("should close upload modal when clicking cancel", async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload Panorama")');
    await uploadButton.click();

    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();

    const cancelButton = page.locator('.ant-modal button:has-text("Cancel")');
    await cancelButton.click();

    await expect(modal).not.toBeVisible();
  });

  test("should display analytics chart section", async ({ page }) => {
    const section = page.locator("text=Panorama Statistics");
    await expect(section).toBeVisible();
  });

  test("should display panorama table", async ({ page }) => {
    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });
});
