import { test as base, expect } from '@playwright/test'
import { createE2eEmail, E2E_TEST_PASSWORD, signupViaApi } from '../helpers/test-api'

type AuthenticatedFixtures = {
  authenticatedEmail: string
}

/** Extends Playwright with an API-registered user whose cookies are shared with the page. */
export const test = base.extend<AuthenticatedFixtures>({
  authenticatedEmail: async ({ page }, use) => {
    const email = createE2eEmail('user')

    await signupViaApi(page.request, email)
    await use(email)
  },
})

export { expect }

/** Signs up through the login UI and lands on the dashboard. */
export async function signupThroughLoginPage(
  page: import('@playwright/test').Page,
  email: string,
  password = E2E_TEST_PASSWORD,
): Promise<void> {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}
