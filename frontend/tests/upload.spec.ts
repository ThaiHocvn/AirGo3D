import { test, expect } from "@playwright/test";
import { mockPanoramaApi } from "./setup/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPanoramaApi(page);
});

test("upload panorama", async ({ page }) => {
  await page.goto("/images");

  await page.getByTestId("open-upload-modal").click();

  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByTestId("upload-input").click(),
  ]);

  await chooser.setFiles("./tests/files/sample.jpg");

  await expect(page.getByText("Upload successful")).toBeVisible();
});
