import { test, expect } from '@playwright/test';

// Standard mock user for E2E
const MOCK_USER = {
    id: 'e2e-mock-user-id',
    email: 'tester@example.com',
    name: 'E2E Tester'
};

test.describe('Mock Auth Flow', () => {
    test.beforeEach(async ({ context }) => {
        // Set the mock user cookie before each test in this suite
        await context.addCookies([{
            name: 'e2e-mock-user',
            value: JSON.stringify(MOCK_USER),
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        }]);
    });

    test('should redirect away from login with mock auth', async ({ page }) => {
        await page.goto('/login');

        // Mock-authenticated users should be redirected to the app home
        await expect(page).toHaveURL(/focus/);

        // Verify setup screen is visible
        await expect(page.getByText(/1\. Pick Session Tasks/i)).toBeVisible();
    });

    test('should navigate through session flow with mock auth', async ({ page }) => {
        await page.goto('/focus');

        // Should see the setup screen
        await expect(page.getByText(/1\. Pick Session Tasks/i)).toBeVisible();

        // Add a task
        await page.getByPlaceholder(/add a task/i).fill('Mocked Auth Task');
        await page.keyboard.press('Enter');
        await expect(page.getByText('Mocked Auth Task')).toBeVisible();

        // Start session
        await page.getByRole('button', { name: /start session/i }).click();
        await expect(page).toHaveURL(/\/sessions\//, { timeout: 15000 });

        // Verify session view
        await expect(page.getByText(/session tasks/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('button', { name: /end session/i })).toBeVisible();
        await expect(page.getByText('Mocked Auth Task').first()).toBeVisible();

        // Complete task
        await page.getByRole('button', { name: /mocked auth task/i }).first().click();
        await expect(page.getByText('1 of 1 filed')).toBeVisible();

        // End session
        await page.getByRole('button', { name: /end session/i }).click();
        const endToSummaryButton = page.getByRole('button', { name: /end and view summary/i });
        const exitToFocusButton = page.getByRole('button', { name: /return to focus/i });

        if (await endToSummaryButton.isVisible()) {
            await endToSummaryButton.click();
            await expect(page).toHaveURL(/\/sessions\/.+\/summary$/, { timeout: 15000 });
            await expect(page.getByRole('heading', { name: /session filed/i })).toBeVisible({ timeout: 15000 });
        } else {
            await expect(exitToFocusButton).toBeVisible();
            await exitToFocusButton.click();
            await expect(page).toHaveURL(/\/focus$/, { timeout: 15000 });
        }
    });
});
