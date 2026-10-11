import { readFileSync, existsSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { TEST_ENV } from '../playwright.config'

type Mail = { to: string; subject: string; html: string; replyTo?: string }

const outbox = (): Mail[] =>
  existsSync(TEST_ENV.EMAIL_TEST_OUTBOX)
    ? readFileSync(TEST_ENV.EMAIL_TEST_OUTBOX, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : []

test.describe.configure({ mode: 'serial' })

test('contact form validates, sends to Lara and replies', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once')
  const marker = `Contact ${Date.now()}`
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('#c-name-error')).toHaveText('Please tell Lara your name')

  await page.locator('#c-name').fill(marker)
  await page.locator('#c-email').fill('person@example.com')
  await page.locator('#c-topic').selectOption('A painting or print')
  await page.locator('#c-msg').fill('Hello Lara, this is an automated test of the contact form.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('heading', { name: 'Your note is on its way' })).toBeVisible()

  const mails = outbox().filter((m) => m.subject.includes(marker) || m.html.includes(marker))
  expect(mails.map((m) => m.to).sort()).toEqual(['lara@example.com', 'person@example.com'])
  expect(mails.find((m) => m.to === 'lara@example.com')?.replyTo).toBe('person@example.com')
})

test('commission form switches sizes, uploads references and replies', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once')
  const marker = `Commission ${Date.now()}`
  await page.goto('/commissions')
  await expect(page.locator('label[for=k-size]')).toHaveText('Canvas size')
  await page
    .getByRole('button', { name: /^Digital illustration/ })
    .first()
    .click()
  await expect(page.locator('label[for=k-size]')).toHaveText('What will it be used for?')

  await page.locator('#k-name').fill(marker)
  await page.locator('#k-email').fill('commission@example.com')
  await page.locator('#k-idea').fill('Two cats as tiny forest wizards, reading by lantern light.')
  await page
    .locator('input[type=file][name=references]')
    .setInputFiles(['design/assets/illus-1.jpg', 'design/assets/firefly.jpg'])
  await page.getByRole('button', { name: 'Send my idea' }).click()
  await expect(page.getByRole('heading', { name: 'Your idea is in safe paws' })).toBeVisible({
    timeout: 60_000,
  })

  const toLara = outbox().find((m) => m.to === 'lara@example.com' && m.subject.includes(marker))
  expect(toLara?.html.match(/cdn\.sanity\.io/g)?.length).toBe(2)
  expect(outbox().some((m) => m.to === 'commission@example.com')).toBe(true)
})

test('honeypot submissions are quietly dropped', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'runs once')
  const marker = `Bot ${Date.now()}`
  await page.goto('/contact')
  await page.locator('#c-name').fill(marker)
  await page.locator('#c-email').fill('bot@example.com')
  await page.locator('#c-msg').fill('Buy cheap things now from my website please.')
  await page.locator('input[name=website]').fill('http://spam.example', { force: true })
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('heading', { name: 'Your note is on its way' })).toBeVisible()
  expect(outbox().some((m) => m.subject.includes(marker))).toBe(false)
})
