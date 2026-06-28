import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('shows public market news without signing in', async ({ page }) => {
    const newsResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/dashboard/news') &&
        response.request().method() === 'GET' &&
        response.ok(),
    )

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Industry headlines (live)' })).toBeVisible()
    await newsResponse

    await expect(page.getByTestId('news-feed')).toBeVisible()
    await expect(
      page.getByText(/No headlines available right now|Broad market news from multiple sources/),
    ).toBeVisible()
  })
})
