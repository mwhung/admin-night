import { expect, test } from '@playwright/test'

const MOCK_USER = {
    id: 'e2e-mock-user-id',
    email: 'tester@example.com',
    name: 'E2E Tester',
}

test.describe('Settings Account', () => {
    test.beforeEach(async ({ context }) => {
        await context.addCookies([{
            name: 'e2e-mock-user',
            value: JSON.stringify(MOCK_USER),
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        }])
    })

    test('opens account settings and sends password reset request', async ({ page }) => {
        await page.route('**/api/auth/password-reset', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'Password reset email sent to tester@example.com.',
                }),
            })
        })

        await page.goto('/settings')
        await expect(page.getByRole('heading', { name: /hi,/i })).toBeVisible()

        await page.getByRole('link', { name: /manage account/i }).click()
        await expect(page).toHaveURL(/\/settings\/account$/)
        await expect(page.getByRole('heading', { name: /account & security/i })).toBeVisible()

        await page.getByRole('button', { name: /send password reset email/i }).click()
        await expect(page.getByText(/password reset email sent to tester@example.com/i)).toBeVisible()
    })
})
