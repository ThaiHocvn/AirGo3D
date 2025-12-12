import { Page } from "@playwright/test";

export async function mockPanoramaApi(page: Page) {
  // Mock GET /api/panoramas
  await page.route("**/api/panoramas**", async (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "1",
          name: "Kitchen Panorama",
          thumbnail: "/mock/kitchen-thumb.jpg",
          url: "/mock/kitchen.jpg",
          isBookmarked: false,
        },
        {
          id: "2",
          name: "Living Room",
          thumbnail: "/mock/living-thumb.jpg",
          url: "/mock/living.jpg",
          isBookmarked: true,
        },
      ]),
    });
  });

  // Mock upload panorama
  await page.route("**/api/upload**", async (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Upload successful",
        id: "999",
      }),
    });
  });
}
