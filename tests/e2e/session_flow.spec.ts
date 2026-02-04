import { test, expect } from '@playwright/test'

test.describe('Session Flow', () => {
    // Generate a unique email for this test run to avoid Supabase conflicts
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'Password123!'

    test('should complete a full session flow (with registration)', async ({ page }) => {
        // 1. Register a new user
        await page.goto('/register')
        await page.locator('#email').fill(testEmail)
        await page.locator('#password').fill(testPassword)
        await page.getByRole('button', { name: /create your quiet space/i }).click()

        // Wait for success message
        await expect(page.getByText(/welcome aboard/i)).toBeVisible({ timeout: 10000 })

        // Success state and redirect to login
        await expect(page).toHaveURL(/login/, { timeout: 15000 })

        // 2. Login
        await page.getByLabel('Email').fill(testEmail)
        await page.getByLabel('Password').fill(testPassword)
        await page.getByRole('button', { name: /enter your quiet space/i }).click()

        // Wait for dashboard
        await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

        // 3. Start Admin Session from Dashboard
        await page.getByRole('link', { name: /start admin session/i }).click()
        await expect(page).toHaveURL(/admin-mode/)

        // 4. Setup Session (We should see "1. Choose Focus Time" or similar)
        // Note: The UI might take a moment to load history
        await expect(page.getByText(/1\. Choose Focus Time/i)).toBeVisible()

        // Add a task
        await page.getByPlaceholder(/enter a new task/i).fill('E2E Focus Task')
        await page.keyboard.press('Enter')

        // Check if task is added
        await expect(page.getByText('E2E Focus Task')).toBeVisible()

        // Start the session
        await page.getByRole('button', { name: /start session/i }).click()

        // 5. In Active Session
        await expect(page.getByText(/today's tasks/i)).toBeVisible()
        await expect(page.getByText('E2E Focus Task')).toBeVisible()

        // Toggle task completion
        // In the UI, the task text itself might be clickable within the checklist
        await page.getByText('E2E Focus Task').click()

        // Check if stats updated (0 of 1 completed -> 1 of 1 completed)
        await expect(page.getByText('1 of 1 completed')).toBeVisible()

        // 6. End Session Early
        await page.getByRole('button', { name: /exit session early/i }).click()

        // 7. Verify Finished View
        await expect(page.getByText(/brain space released/i)).toBeVisible()
        await expect(page.getByText('1', { exact: true })).toBeVisible() // Completed count

        // Finish - Go back to Lounge
        await page.getByRole('button', { name: /back to lounge/i }).click()
        await expect(page).toHaveURL(/admin-mode/)
    })
})
