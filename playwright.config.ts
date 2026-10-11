import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://localhost:${PORT}`

/**
 * End-to-end tests run a production build against the `development` Sanity dataset, which has
 * fake test prices (npm run seed:test-prices), PayFast's public sandbox merchant, and an email
 * outbox file instead of Resend. Nothing here touches Lara's real content or sends real email.
 */
export const TEST_ENV = {
  NEXT_PUBLIC_SANITY_DATASET: 'development',
  NEXT_PUBLIC_SITE_URL: baseURL,
  PAYFAST_MODE: 'sandbox',
  PAYFAST_MERCHANT_ID: '10000100',
  PAYFAST_MERCHANT_KEY: '46f0cd694581a',
  PAYFAST_PASSPHRASE: 'jt7NOE43FZPn',
  LARA_EMAIL: 'lara@example.com',
  EMAIL_TEST_OUTBOX: 'test-results/outbox.jsonl',
  RESEND_API_KEY: '',
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry', reducedMotion: 'reduce' },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: TEST_ENV,
  },
})
