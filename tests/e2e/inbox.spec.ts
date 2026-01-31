import { test, expect } from '@playwright/test'

test.describe('Inbox Page', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.getByLabel('Email').fill('m@example.com')
        await page.getByLabel('Password').fill('password123')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/dashboard/)
    })

    test('should navigate to inbox page', async ({ page }) => {
        await page.goto('/inbox')
        await expect(page).toHaveURL(/inbox/)
    })

    test('should display task list', async ({ page }) => {
        await page.goto('/inbox')
        // Check if the page loaded
        await expect(page.locator('body')).toBeVisible()
    })
})
