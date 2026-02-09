import { test, expect } from '@playwright/test'

test.describe('Session Flow', () => {
    const MOCK_USER = {
        id: 'session-flow-user-id',
        email: 'session-flow@example.com',
        name: 'Session Flow Tester',
    }

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

    test('should complete a full session flow', async ({ page }) => {
        // 1. Enter the authenticated setup screen
        await page.goto('/focus')
        await expect(page.getByText(/1\. Declutter Your Mind/i)).toBeVisible()

        // Add tasks
        await page.getByPlaceholder(/enter a new task/i).fill('E2E Focus Task A')
        await page.keyboard.press('Enter')
        await page.getByPlaceholder(/enter a new task/i).fill('E2E Focus Task B')
        await page.keyboard.press('Enter')

        // Check if tasks are added
        await expect(page.getByText('E2E Focus Task A')).toBeVisible()
        await expect(page.getByText('E2E Focus Task B')).toBeVisible()

        // Start the session
        await page.getByRole('button', { name: /start session/i }).click()
        await expect(page).toHaveURL(/\/sessions\//, { timeout: 15000 })

        // 5. In Active Session
        await expect(page.getByText(/today's tasks/i)).toBeVisible({ timeout: 15000 })
        await expect(page.getByText('E2E Focus Task A').first()).toBeVisible()
        await expect(page.getByText('E2E Focus Task B').first()).toBeVisible()
        await expect(page.getByRole('button', { name: /exit session early/i })).toBeVisible({ timeout: 15000 })

        // Toggle one task completion (1 of 2 => 50%)
        await page.getByRole('button', { name: /e2e focus task a/i }).first().click()
        await expect(page.getByText('1 of 2 completed')).toBeVisible()
        await expect(page.getByText('50%')).toBeVisible()

        // Modify tasks and add one more (1 of 3 should still be 50%)
        await page.getByRole('button', { name: /modify tasks/i }).click()
        await page.getByPlaceholder(/add a missing task/i).fill('E2E Focus Task C')
        await page.keyboard.press('Enter')
        await page.locator('button:has-text("Save Changes & Resume")').first().evaluate((button) => {
            (button as HTMLElement).click()
        })
        await expect(page.getByText('1 of 3 completed')).toBeVisible()
        await expect(page.getByText('50%')).toBeVisible()

        // Complete all tasks (3 of 3 => 150% based on baseline 2)
        await page.getByRole('button', { name: /e2e focus task b/i }).first().click()
        await page.getByRole('button', { name: /e2e focus task c/i }).first().click()
        await expect(page.getByText('3 of 3 completed')).toBeVisible()
        await expect(page.getByText('150%')).toBeVisible()

        // 6. End Session Early
        await page.getByRole('button', { name: /exit session early/i }).click()
        const endToSummaryButton = page.getByRole('button', { name: /end & view summary/i })
        const exitToFocusButton = page.getByRole('button', { name: /exit to focus/i })

        if (await endToSummaryButton.isVisible()) {
            await endToSummaryButton.click()
            await expect(page).toHaveURL(/\/sessions\/.+\/summary$/, { timeout: 15000 })

            // 7. Verify Finished View
            await expect(page.getByRole('heading', { name: /released/i })).toBeVisible({ timeout: 15000 })
            await expect(page.getByRole('button', { name: /back to lounge/i })).toBeVisible()

            // Finish - Go back to Lounge
            await page.getByRole('button', { name: /back to lounge/i }).click()
            await expect(page.getByText(/1\. Declutter Your Mind/i)).toBeVisible()
        } else {
            await expect(exitToFocusButton).toBeVisible()
            await exitToFocusButton.click()
            await expect(page).toHaveURL(/\/focus$/, { timeout: 15000 })
        }
    })
})
