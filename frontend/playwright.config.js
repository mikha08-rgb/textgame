import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 360000, // 6 minutes for AI generation tests (allows buffer over 5min generation)
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
