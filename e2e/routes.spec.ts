import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { SHOW_PAINTINGS } from '../src/lib/site'

const ROUTES = [
  '/',
  '/gallery',
  '/gallery?tab=digital',
  '/gallery/stag',
  '/about',
  '/contact',
  '/shop',
  ...(SHOW_PAINTINGS ? ['/shop/originals', '/shop/firefly', '/shop/lantern'] : []),
  '/shop/prints',
  '/shop/octopus',
  '/commissions',
  '/classes',
  '/faq',
  '/terms',
  '/privacy',
  '/checkout',
]

for (const route of ROUTES) {
  test(`${route} renders, fits the screen and passes axe`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const res = await page.goto(route, { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, 'no sideways scrolling').toBeLessThanOrEqual(1)

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(
      axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([])
    expect(errors).toEqual([])
  })
}

test('unknown pages show the 404', async ({ page }) => {
  const res = await page.goto('/this-path-leads-nowhere')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'This path leads nowhere' })).toBeVisible()
})
