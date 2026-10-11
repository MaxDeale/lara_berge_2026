import { expect, test } from '@playwright/test'
import { checkoutSignature } from '../src/lib/payfast/signature'
import { TEST_ENV } from '../playwright.config'

// Reserves a real (test) original, so run once, not per viewport
test.describe.configure({ mode: 'serial' })

test('add an original and a print, check out, and hand a signed payload to PayFast', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once')

  await page.goto('/shop/firefly')
  await page.getByRole('button', { name: 'Add to cart' }).click()
  const drawer = page.getByRole('dialog', { name: /Your cart/ })
  await expect(drawer).toContainText('one of a kind')
  await drawer.getByRole('button', { name: 'Close cart' }).click()

  await page.goto('/shop/octopus')
  // Shoppers click the size card (the radio inside it is visually hidden)
  await page.locator('label', { has: page.getByRole('radio', { name: /^A2/ }) }).click()
  await expect(page.getByRole('radio', { name: /^A2/ })).toBeChecked()
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await drawer.getByRole('button', { name: 'More' }).click()
  await expect(drawer).toContainText('Your cart (3)')
  // R4 500 original + 2 × R1 850 A2 prints (test prices)
  await expect(drawer).toContainText('R8 200')
  await drawer.getByRole('link', { name: 'Checkout' }).click()

  await expect(page).toHaveURL(/\/checkout$/)
  const summary = page.getByRole('complementary')
  await expect(summary.getByText('Total', { exact: true })).toBeVisible()
  await expect(summary).toContainText('R8 350') // + R150 courier

  // Validation runs before anything is reserved
  await summary.getByRole('button', { name: /Pay with PayFast/ }).click()
  await expect(page.locator('#co-first-error')).toBeVisible()

  for (const [id, value] of [
    ['co-first', 'Test'],
    ['co-last', 'Buyer'],
    ['co-email', 'test.buyer@example.com'],
    ['co-phone', '082 123 4567'],
    ['co-a1', '12 Fern Lane'],
    ['co-sub', 'Kloof'],
    ['co-city', 'Durban'],
    ['co-prov', 'KwaZulu-Natal'],
    ['co-zip', '3610'],
  ]) {
    await page.locator(`#${id}`).fill(value)
  }

  // Catch the hand-over instead of really going to PayFast
  let posted: URLSearchParams | null = null
  await page.route('https://sandbox.payfast.co.za/**', async (route) => {
    posted = new URLSearchParams(route.request().postData() ?? '')
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>PayFast (test)</h1>' })
  })
  await summary.getByRole('button', { name: /Pay with PayFast/ }).click()
  await expect(page.getByRole('heading', { name: 'PayFast (test)' })).toBeVisible()

  const fields = [...(posted as unknown as URLSearchParams).entries()]
  const data = Object.fromEntries(fields)
  expect(fields.map(([k]) => k)).toEqual([
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'signature',
  ])
  expect(data.amount).toBe('8350.00')
  expect(data.m_payment_id).toMatch(/^order-[A-Za-z0-9]{22}$/)
  expect(data.item_name).toMatch(/^Lara Berge Artworks order LB-\d{4}$/)
  expect(data.return_url).toBe(`${TEST_ENV.NEXT_PUBLIC_SITE_URL}/order/${data.m_payment_id}`)
  expect(data.notify_url).toBe(`${TEST_ENV.NEXT_PUBLIC_SITE_URL}/api/payfast/itn`)
  const unsigned = fields.filter(([k]) => k !== 'signature')
  expect(data.signature).toBe(checkoutSignature(unsigned, TEST_ENV.PAYFAST_PASSPHRASE))

  // The firefly original is now reserved: a second shopper can't buy it
  await page.goto('/shop/firefly')
  await expect(page.getByText(/someone is checking out right now/)).toBeVisible()
  // Cancelling at PayFast releases it again
  await page.goto(`/checkout?cancelled=${data.m_payment_id}`)
  await expect(page.getByText(/payment was cancelled/)).toBeVisible()
})
