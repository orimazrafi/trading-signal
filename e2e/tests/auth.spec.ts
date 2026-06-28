import { expect, test } from '@playwright/test'
import { createE2eEmail } from '../helpers/test-api'
import { signupThroughLoginPage } from '../fixtures/authenticated'

test.describe('Authentication', () => {
  test('signs up through the login page and opens the dashboard', async ({ page }) => {
    const email = createE2eEmail('signup')

    await signupThroughLoginPage(page, email)

    await expect(page.getByRole('tab', { name: 'Market News' })).toBeVisible()
    await expect(page.getByLabel('Dashboard sections')).toBeVisible()
  })
})
