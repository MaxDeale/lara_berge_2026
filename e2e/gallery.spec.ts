import { expect, test } from '@playwright/test'

test('gallery tabs keep the collection in the URL', async ({ page }) => {
  await page.goto('/gallery')
  await expect(page.getByRole('tab', { name: /Paintings/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('tab', { name: /Digital illustration/ }).click()
  await expect(page).toHaveURL(/\?tab=digital$/)
  await expect(page.getByRole('tabpanel')).toBeVisible()

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  await page.getByRole('tab', { name: /Digital illustration/ }).press('ArrowLeft')
  await expect(page.getByRole('tab', { name: /Paintings/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page).toHaveURL(/\/gallery$/)

  await page.goto('/gallery?tab=digital')
  await expect(page.getByRole('tab', { name: /Digital illustration/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('lightbox opens over the gallery, steps through pieces and closes', async ({ page }) => {
  await page.goto('/gallery?tab=digital')
  await page.getByRole('tabpanel').getByRole('link').nth(2).click()
  const viewer = page.getByRole('dialog', { name: 'Artwork viewer' })
  await expect(viewer).toBeVisible()
  await expect(page).toHaveURL(/\/gallery\/octopus$/)
  await expect(viewer).toContainText('3 of 23')

  await page.keyboard.press('ArrowRight')
  await expect(viewer).toContainText('4 of 23')
  await expect(page).toHaveURL(/\/gallery\/firefly-girl$/)
  await page.keyboard.press('ArrowLeft')
  await expect(viewer).toContainText('3 of 23')

  await page.keyboard.press('Escape')
  await expect(viewer).toBeHidden()
  await expect(page).toHaveURL(/\/gallery\?tab=digital$/)
})

test('a direct link opens the full-page viewer', async ({ page }) => {
  await page.goto('/gallery/stag')
  const viewer = page.getByRole('dialog', { name: 'Artwork viewer' })
  await expect(viewer).toBeVisible()
  await viewer.getByRole('button', { name: 'Close viewer' }).click()
  await expect(page).toHaveURL(/\/gallery\?tab=digital$/)
})
