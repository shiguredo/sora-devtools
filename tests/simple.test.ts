import { test } from '@playwright/test'

test('simple', async ({ page }) => {
  await page.goto('http://localhost:3333/')
})
