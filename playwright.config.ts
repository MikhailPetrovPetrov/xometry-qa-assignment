import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1, // Строго один поток для контроля ситуации
  timeout: 60000,
  use: {
    baseURL: 'https://get.preprod.xometry.eu',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});