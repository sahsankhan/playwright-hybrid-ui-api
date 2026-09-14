import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 1,
  workers: isCi ? 2 : undefined,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: isCi ? [['html', { open: 'never' }], ['github'], ['list']] : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: config.uiBaseUrl,
    actionTimeout: config.timeouts.actionMs,
    navigationTimeout: config.timeouts.navigationMs,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
