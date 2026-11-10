import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  reporter: "list",
  use: { channel: "msedge", baseURL: "http://127.0.0.1:3100" },
  webServer: [
    { command: "corepack.cmd yarn start --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: false },
    { command: "corepack.cmd yarn dev --port 3101", url: "http://127.0.0.1:3101", reuseExistingServer: false, env: { DANBIKKO_TEST_CATALOG: resolve("tests/fixtures/products.json") } },
    { command: "corepack.cmd yarn dev --port 3102", url: "http://127.0.0.1:3102", reuseExistingServer: false, env: { DANBIKKO_TEST_CATALOG: resolve("tests/fixtures/empty.json"), DANBIKKO_TEST_DIST: ".next-empty-e2e" } },
  ],
});
