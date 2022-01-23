// https://playwright.dev/docs/test-configuration

import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./src/__playwright__",
  use: {
    baseURL: "http://localhost:8080",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm run webpack:dev",
    port: 8080,
    reuseExistingServer: true,
  },
};

export default config;
