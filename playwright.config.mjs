import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', {open:'never'}]],
  use: {
    baseURL: 'http://127.0.0.1:4173/MY-ColorVision/',
    viewport: {width:1440,height:900},
    reducedMotion:'reduce',
    trace:'retain-on-failure',
    screenshot:'only-on-failure'
  },
  projects: [{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer: {
    command:'node tests/server.mjs',
    url:'http://127.0.0.1:4173/MY-ColorVision/',
    reuseExistingServer: !process.env.CI
  }
});
