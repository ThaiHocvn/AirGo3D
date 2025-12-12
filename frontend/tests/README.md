# Playwright Tests

This directory contains end-to-end tests for the AirGo3D frontend application using Playwright.

## Test Files

- `dashboard.spec.ts` - Tests the dashboard (overview, navigation, stats, widgets, etc.)
- `panorama-table.spec.ts` - Tests the panorama list table (sorting, filtering, searching, pagination, actions)
- `upload.spec.ts` - Tests the panorama upload flow (file selection, drag-and-drop, validation, upload success)
- `viewer.spec.ts` - Tests the panorama viewer (360° interactions, hotspots, fullscreen, loading states, thumbnails)

## Running Tests

### Run all tests

```bash
yarn test
```

### Run tests with UI mode (interactive)

```bash
yarn test:ui
```

### Run tests in headed mode (see browser)

```bash
yarn test:headed
```

### Run tests in debug mode

```bash
yarn test:debug
```

### Run specific test file

```bash
yarn playwright test tests/panorama-table.spec.ts
```

### Run tests in specific browser

```bash
yarn playwright test --project=chromium
yarn playwright test --project=firefox
yarn playwright test --project=webkit
```

### Run tests on mobile viewport

```bash
yarn playwright test --project="Mobile Chrome"
yarn playwright test --project="Mobile Safari"
```

## Test Configuration

Tests are configured in `playwright.config.ts`. The configuration includes:

- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Automatic web server startup
- HTML report generation
- Screenshot on failure
- Trace collection on retry

## Writing New Tests

When writing new tests:

1. Create a new `.spec.ts` file in the `tests/` directory
2. Use descriptive test names
3. Use `test.beforeEach` for common setup
4. Use `expect` assertions from Playwright
5. Wait for elements to be visible before interacting
6. Use `page.waitForLoadState("networkidle")` when needed

Example:

```typescript
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("should display expected content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Expected Text")).toBeVisible();
  });
});
```
