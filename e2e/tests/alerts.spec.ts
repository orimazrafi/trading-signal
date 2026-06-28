import { expect, test } from '../fixtures/authenticated'
import { canResolveStockSearch, createAlertViaApi } from '../helpers/test-api'

test.describe('Price alerts', () => {
  test('shows an alert created through the API in the alerts panel', async ({ page, authenticatedEmail }) => {
    void authenticatedEmail

    await createAlertViaApi(page.request, 'MSFT')

    await page.goto('/dashboard/alerts')
    await expect(page.getByRole('heading', { name: 'Price alerts' })).toBeVisible()
    await expect(page.getByTestId('price-alert-list')).toContainText('MSFT')
  })

  test('creates an alert from the form when market data is available', async ({ page, authenticatedEmail }) => {
    void authenticatedEmail

    const canSearch = await canResolveStockSearch(page.request, 'AAPL')
    test.skip(!canSearch, 'Alert form create requires a configured market data API key on the server')

    await page.goto('/dashboard/alerts')

    await page.getByRole('heading', { name: 'Price alerts' }).scrollIntoViewIfNeeded()
    await page.getByLabel('Symbol').first().fill('AAPL')
    await page.getByLabel('Threshold %').fill('2.5')
    await page.getByRole('button', { name: 'Add alert' }).click()

    await expect(page.getByTestId('price-alert-list')).toContainText('AAPL')
  })
})
