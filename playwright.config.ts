import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Just Start E2E tests.
 * Run: npx playwright test
 * Run single file: npx playwright test tests/e2e/tc01-goal-to-energy.spec.ts
 */
export default defineConfig({
  testDir:   './tests/e2e',
  timeout:   15_000,
  retries:   process.env.CI ? 2 : 0,
  workers:   process.env.CI ? 1 : undefined,
  reporter:  'html',

  use: {
    baseURL:       'http://localhost:3000',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    // Mobile-first: use iPhone 14 viewport as primary
    viewport:      { width: 390, height: 844 },
  },

  projects: [
    {
      name:  'mobile-chrome',
      use:   { ...devices['Pixel 7'] },
    },
    {
      name:  'mobile-safari',
      use:   { ...devices['iPhone 14'] },
    },
    // Desktop smoke (optional, lower priority)
    {
      name:  'desktop-chrome',
      use:   { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Next.js dev server before running tests
  webServer: {
    command:            'npm run dev',
    url:                'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout:            30_000,
  },
});
