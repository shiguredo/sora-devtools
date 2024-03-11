import { test } from '@playwright/test'

test('simple', async ({ page }) => {
  // multistream=true&role=sendrecv&videoCodecType=VP9
  const params = new URLSearchParams({
    multistream: 'true',
    role: 'sendrecv',
    videoCodecType: 'VP9',
  })

  await page.goto(`http://localhost:3333/devtools/?${params.toString()}`)
})
