import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: /back to admin night/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
    })

    test('should enforce required email and password fields', async ({ page }) => {
        await page.goto('/login')
        await page.getByRole('button', { name: /^sign in$/i }).click()

        // Native form validation should keep the user on the login page.
        await expect(page).toHaveURL(/\/login/)
        await expect(page.getByLabel('Email')).toBeFocused()
    })

    test('should enter app via mock auth button', async ({ page }) => {
        await page.goto('/login')
        const mockAuthButton = page.getByRole('button', { name: /use mock auth \(dev\)/i })
        await expect(mockAuthButton).toBeVisible()
        await mockAuthButton.click()

        await expect(page).toHaveURL(/\/focus/)
        await expect(page.getByRole('heading', { name: /1\. pick session tasks/i })).toBeVisible()
    })
})
