import {defineConfig, devices} from '@playwright/test';
import {E2E_API_PORT, E2E_DATABASE_URL, E2E_FRONT_PORT} from './e2e/environment';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', {open: 'never'}]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: `http://localhost:${E2E_FRONT_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      env: {PORT: String(E2E_API_PORT), DATABASE_URL: E2E_DATABASE_URL},
      url: `http://localhost:${E2E_API_PORT}/api/health`,
      reuseExistingServer: false,
    },
    {
      command: `npm run dev -- --port ${E2E_FRONT_PORT} --strictPort`,
      env: {API_PROXY_TARGET: `http://localhost:${E2E_API_PORT}`},
      url: `http://localhost:${E2E_FRONT_PORT}`,
      reuseExistingServer: false,
    },
  ],
});
