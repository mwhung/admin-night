import { test, expect, type Locator, type Page } from '@playwright/test'
import { buildMockUser, setMockAuthCookie } from './mocks/mock-user'

async function addTaskFromInput(taskInput: Locator, page: Page, title: string) {
    await taskInput.fill(title)
    await expect(taskInput).toHaveValue(title)
    await taskInput.press('Enter')
    const queuedTask = page.getByText(title).first()

    try {
        await expect(queuedTask).toBeVisible({ timeout: 2000 })
        return
    } catch {
        // WebKit can occasionally miss Enter key submission; use explicit add button as fallback.
    }

    if ((await taskInput.inputValue()) !== title) {
        await taskInput.fill(title)
    }

    const addButton = taskInput.locator('xpath=following-sibling::button[1]').first()
    await expect(addButton).toBeEnabled()
    await addButton.click()
    await expect(queuedTask).toBeVisible()
}

async function addTaskFromSetup(page: Page, title: string) {
    const taskInput = page.getByPlaceholder(/add a task/i).first()
    await addTaskFromInput(taskInput, page, title)
}

test.describe('Session Flow', () => {
    test.beforeEach(async ({ context }, testInfo) => {
        await setMockAuthCookie(context, buildMockUser('session-flow', testInfo))
    })

    test('should complete a full session flow', async ({ page }) => {
        const primaryTaskTitle = 'E2E Focus Task A'
        const secondaryTaskPattern = /inbox zero \(clear emails\)/i

        // 1. Enter the authenticated setup screen
        await page.goto('/focus')
        await expect(page.getByRole('heading', { name: /1\. pick session tasks/i })).toBeVisible()

        // Add tasks (one custom + one suggestion to avoid duplicate local-id collisions in rapid input flows)
        await addTaskFromSetup(page, primaryTaskTitle)
        await page.getByRole('button', { name: secondaryTaskPattern }).click()
        await expect(page.getByText(secondaryTaskPattern)).toBeVisible()

        // Choose a specific soundscape in setup
        await expect(page.getByRole('heading', { name: /3\. pick soundscape/i })).toBeVisible()
        await page.getByRole('button', { name: /receipt lab/i }).click()

        // Start the session
        await page.getByRole('button', { name: /start session/i }).click()
        await expect(page).toHaveURL(/\/sessions\//, { timeout: 15000 })

        // 5. In Active Session
        await expect(page.getByRole('heading', { name: 'Session Tasks', exact: true })).toBeVisible({ timeout: 15000 })
        await expect(page.getByRole('button', { name: /e2e focus task a/i }).first()).toBeVisible()
        await expect(page.getByRole('button', { name: secondaryTaskPattern }).first()).toBeVisible()
        await expect(page.getByRole('button', { name: /end session/i })).toBeVisible({ timeout: 15000 })
        await expect(page.getByRole('button', { name: /next track/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /previous track/i })).toBeVisible()
        await expect(page.getByText(/receipt lab/i)).toBeVisible()

        // Toggle one task completion (1 of 2 => 50%)
        await page.getByRole('button', { name: /e2e focus task a/i }).first().click()
        await expect(page.getByText('1 of 2 filed')).toBeVisible()
        await expect(page.getByText('50%')).toBeVisible()

        // Modify tasks and add one more (1 of 3 should still be 50%)
        await page.getByRole('button', { name: /edit tasks/i }).click()
        await expect(page.getByRole('heading', { name: /edit session tasks/i })).toBeVisible()
        const editTaskInput = page.getByPlaceholder(/add( a)? task/i).first()
        await addTaskFromInput(editTaskInput, page, 'E2E Focus Task C')
        await page.getByRole('button', { name: /save and resume/i }).click()
        await expect(page.getByText('1 of 3 filed')).toBeVisible()
        await expect(page.getByText('50%')).toBeVisible()

        // Complete all tasks (3 of 3 => 150% based on baseline 2)
        await page.getByRole('button', { name: secondaryTaskPattern }).first().click()
        await page.getByRole('button', { name: /e2e focus task c/i }).first().click()
        await expect(page.getByText('3 of 3 filed')).toBeVisible()
        await expect(page.getByText('150%')).toBeVisible()

        // 6. End Session Early
        await page.getByRole('button', { name: /end session/i }).click()
        const endToSummaryButton = page.getByRole('button', { name: /end and view summary/i })
        await expect(endToSummaryButton).toBeVisible()
        await endToSummaryButton.click({ force: true })
        await expect(page).toHaveURL(/\/sessions\/.+\/summary$/, { timeout: 15000 })

        // 7. Verify Finished View
        await expect(page.getByRole('heading', { name: /session filed/i })).toBeVisible({ timeout: 15000 })
        await expect(page.getByRole('button', { name: /back to focus/i })).toBeVisible()

        // Finish - Go back to Lounge
        await page.getByRole('button', { name: /back to focus/i }).click()
        await expect(page.getByText(/1\. Pick Session Tasks/i)).toBeVisible()
    })
})
