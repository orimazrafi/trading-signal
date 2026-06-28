import { expect, test } from '../fixtures/authenticated'

test.describe('Market Ideas filters', () => {
  test('persists sort selection in the URL after refresh', async ({ page, authenticatedEmail }) => {
    void authenticatedEmail

    await page.goto('/dashboard/recommendations')
    await expect(page.getByRole('heading', { name: 'Market Ideas' })).toBeVisible()

    await page.getByLabel('Sort by').click()
    await page.getByRole('option', { name: 'Symbol (A → Z)' }).click()

    await expect(page).toHaveURL(/sort=symbol-asc/)
    await page.reload()
    await expect(page).toHaveURL(/sort=symbol-asc/)
    await expect(page.getByLabel('Sort by')).toContainText('Symbol (A → Z)')
  })
})
