import { test, expect } from '@playwright/test'
import { buildMockUser, setMockAuthCookie } from './mocks/mock-user'

test.describe('Visual Regression', () => {
    test.use({
        viewport: { width: 1280, height: 800 },
    })

    test.beforeEach(async ({ browserName }) => {
        // Keep a single, deterministic baseline set for visual snapshots.
        test.skip(browserName !== 'chromium', 'Visual snapshots are maintained for chromium only.')
    })

    test('landing / focus setup should look therapy-ready', async ({ page, context }, testInfo) => {
        await setMockAuthCookie(context, buildMockUser('visual-regression', testInfo))
        await page.goto('/focus')
        await expect(page.getByRole('heading', { name: /admin night/i })).toBeVisible()

        // Capture only the main app surface to avoid realtime header variance.
        await expect(page.locator('main')).toHaveScreenshot('admin-mode-setup.png', {
            maxDiffPixelRatio: 0.1
        })
    })

    test('login page aesthetic check', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: /back to admin night/i })).toBeVisible()

        await expect(page.locator('main')).toHaveScreenshot('login-page.png', {
            maxDiffPixelRatio: 0.1
        })
    })

    test('register page aesthetic check', async ({ page }) => {
        await page.goto('/register')
        await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()

        await expect(page.locator('main')).toHaveScreenshot('register-page.png', {
            maxDiffPixelRatio: 0.1
        })
    })
})
