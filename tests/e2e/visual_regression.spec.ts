import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    test('landing / admin-mode setup should look therapy-ready', async ({ page }) => {
        await page.goto('/');
        // Wait for the main elements to load
        await expect(page.getByRole('heading', { name: /Admin Night/i })).toBeVisible();

        // Take a full page screenshot
        await expect(page).toHaveScreenshot('admin-mode-setup.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.1
        });
    });

    test('login page aesthetic check', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByText(/Welcome back/i)).toBeVisible();

        await expect(page).toHaveScreenshot('login-page.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('register page aesthetic check', async ({ page }) => {
        await page.goto('/register');
        await expect(page.getByText(/Join the quiet space/i)).toBeVisible();

        await expect(page).toHaveScreenshot('register-page.png', {
            maxDiffPixelRatio: 0.1
        });
    });
});
