import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login')
        await page.getByLabel('Email').fill('wrong@example.com')
        await page.getByLabel('Password').fill('wrongpassword')
        await page.getByRole('button', { name: /enter your quiet space/i }).click()
        // Should stay on login page or show error
        await expect(page).toHaveURL(/login/)
    })

    test('should redirect to dashboard after login', async ({ page }) => {
        await page.goto('/login')
        await page.getByLabel('Email').fill('m@example.com')
        await page.getByLabel('Password').fill('password123')
        await page.getByRole('button', { name: /enter your quiet space/i }).click()
        // Should redirect to dashboard
        await expect(page).toHaveURL(/dashboard/)
    })
})
