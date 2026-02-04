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

    test('should access dashboard directly with mock auth', async ({ page }) => {
        await page.goto('/dashboard');

        // Should not be redirected to login
        await expect(page).toHaveURL(/dashboard/);

        // Verify we see dashboard content
        await expect(page.getByText(/Insights & History/i)).toBeVisible();
    });

    test('should navigate through session flow with mock auth', async ({ page }) => {
        await page.goto('/admin-mode');

        // Should see the setup screen
        await expect(page.getByText(/1\. Choose Focus Time/i)).toBeVisible();

        // Add a task
        await page.getByPlaceholder(/enter a new task/i).fill('Mocked Auth Task');
        await page.keyboard.press('Enter');
        await expect(page.getByText('Mocked Auth Task')).toBeVisible();

        // Start session
        await page.getByRole('button', { name: /start session/i }).click();

        // Verify session view
        await expect(page.getByText(/today's tasks/i)).toBeVisible();
        await expect(page.getByText('Mocked Auth Task').first()).toBeVisible();

        // Complete task
        await page.getByText('Mocked Auth Task').first().click();
        await expect(page.getByText('1 of 1 completed')).toBeVisible();

        // End session
        await page.getByRole('button', { name: /exit session early/i }).click();
        await expect(page.getByText(/brain space released/i)).toBeVisible();
    });
});
