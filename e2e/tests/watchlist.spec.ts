import { expect, test } from '../fixtures/authenticated'
import {
  addStockToDefaultWatchlistViaApi,
  canResolveStockSearch,
  mockAaplChartData,
  signupViaApi,
  createE2eEmail,
} from '../helpers/test-api'

test.describe('Watchlist', () => {
  test('loads a saved stock chart from the watchlist', async ({ page, authenticatedEmail }) => {
    void authenticatedEmail

    const canSearch = await canResolveStockSearch(page.request, 'AAPL')
    test.skip(!canSearch, 'Stock search requires a configured market data API key on the server')

    await addStockToDefaultWatchlistViaApi(page.request, 'AAPL')
    await mockAaplChartData(page)

    await page.goto('/watchlist')
    await page.getByRole('button', { name: /AAPL/ }).click()

    await expect(page).toHaveURL(/\/watchlist\/AAPL/)
    await expect(page.getByTestId('stock-chart-panel')).toBeVisible()
    await expect(page.getByText('May differ from actual market price')).toBeVisible()
    await expect(page.getByText('Apple Inc.')).toBeVisible()
  })

  test('shows the watchlist shell for a signed-in user', async ({ page }) => {
    const email = createE2eEmail('watchlist-shell')
    await signupViaApi(page.request, email)

    await page.goto('/watchlist')

    await expect(page.getByRole('heading', { name: 'Stock search' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Watchlist' })).toHaveAttribute('aria-selected', 'true')
  })
})
