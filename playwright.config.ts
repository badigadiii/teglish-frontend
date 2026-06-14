import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "cd /home/badigadiii/uni/teglish/teglish-backend && docker compose up -d postgres && uv run alembic upgrade head && uv run uvicorn src.main:app --host 127.0.0.1 --port 8000",
      url: "http://127.0.0.1:8000/docs",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 pnpm dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
