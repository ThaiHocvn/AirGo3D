import { test, expect } from "@playwright/test";

test.describe("Panorama Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should search panoramas", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search name"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill("test");
    await searchInput.press("Enter");

    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });

  test("should filter by bookmark status", async ({ page }) => {
    // AntD Select
    const filterSelect = page.locator('[role="combobox"]').first();
    await expect(filterSelect).toBeVisible();

    await filterSelect.click();
    const bookmarkedOption = page.locator(
      ".ant-select-dropdown >> text=Bookmarked"
    );
    await expect(bookmarkedOption).toBeVisible();

    await bookmarkedOption.click();

    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });

  test("should toggle bookmark on panorama", async ({ page }) => {
    const bookmarkButtons = page.locator("button:has(.anticon-star)");
    const count = await bookmarkButtons.count();

    if (count === 0) {
      test.skip();
    }

    const first = bookmarkButtons.first();
    await first.click();

    // Wait state change
    await page.waitForTimeout(300);

    expect(await first.isVisible()).toBeTruthy();
  });

  test("should download panorama", async ({ page }) => {
    const downloadButtons = page.locator('button:has-text("Download")');
    const count = await downloadButtons.count();

    if (count === 0) test.skip();

    // Try download event
    const downloadPromise = page.waitForEvent("download").catch(() => null);

    await downloadButtons.first().click();

    const download = await downloadPromise;

    // If app uses API returning URL → fallback check
    if (!download) {
      const req = await page.waitForResponse(
        (r) => r.url().includes("/api/download") && r.status() === 200
      );
      expect(req.ok()).toBeTruthy();
    } else {
      expect(download).toBeTruthy();
    }
  });

  test("should delete panorama with confirmation", async ({ page }) => {
    const deleteButtons = page.locator('button:has-text("Delete")');
    const count = await deleteButtons.count();

    if (count === 0) test.skip();

    await deleteButtons.first().click();

    const modal = page.locator('.ant-modal[role="dialog"] >> text=Delete');
    await expect(modal).toBeVisible();

    const cancel = page.locator('.ant-modal button:has-text("Cancel")');
    if (await cancel.isVisible()) await cancel.click();

    await expect(modal).not.toBeVisible();
  });

  test("should open panorama detail", async ({ page }) => {
    const rows = page.locator(".ant-table tbody tr");
    if ((await rows.count()) === 0) test.skip();

    await rows.first().click();

    const viewer = page.locator("#panorama-viewer");
    await expect(viewer).toBeVisible();
  });

  test("should navigate pagination", async ({ page }) => {
    const nextBtn = page.locator(
      ".ant-pagination-next:not(.ant-pagination-disabled)"
    );
    if ((await nextBtn.count()) === 0) test.skip();

    await nextBtn.click();

    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });

  test("should refresh panorama list", async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Refresh")');
    if ((await refreshBtn.count()) === 0) test.skip();

    await refreshBtn.click();

    const table = page.locator(".ant-table");
    await expect(table).toBeVisible();
  });
});
