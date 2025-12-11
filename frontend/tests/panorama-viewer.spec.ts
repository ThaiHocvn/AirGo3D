import { test, expect } from "@playwright/test";

test.describe("Panorama Viewer Page", () => {
  test("should navigate to viewer page when clicking View button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const viewButtons = page.locator('button:has-text("View")');
    const count = await viewButtons.count();

    if (count > 0) {
      await viewButtons.first().click();

      // Should navigate to viewer page
      await expect(page).toHaveURL(/\/viewer\//);

      await expect(
        page.locator('button:has-text("Back to List")')
      ).toBeVisible();
    } else {
      console.warn("No panoramas found → skipping View button test");
    }
  });

  test("should display viewer controls", async ({ page }) => {
    await page.goto("/viewer/test-id");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('button:has-text("Back to List")')).toBeVisible();

    const bookmarkBtn = page.locator(
      'button:has-text("Bookmark"), button:has-text("Bookmarked")'
    );
    await expect(bookmarkBtn.first()).toBeVisible();

    await expect(page.locator('button:has-text("Download")')).toBeVisible();

    await expect(
      page.locator("#panorama-viewer, canvas, .viewer-container").first()
    ).toBeVisible();
  });

  test("should navigate back to list page", async ({ page }) => {
    await page.goto("/viewer/test-id");
    await page.waitForLoadState("networkidle");

    const backButton = page.locator('button:has-text("Back to List")');

    await backButton.click();

    await expect(page).toHaveURL("/");
  });
});
