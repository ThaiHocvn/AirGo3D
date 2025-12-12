import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],

  use: {
    baseURL: "http://localhost:3000",
    headless: false,
  },

  webServer: {
    command: "yarn start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  workers: 1,
});
