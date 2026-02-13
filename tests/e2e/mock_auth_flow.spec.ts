import { test, expect, type Page, type Locator } from '@playwright/test'
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

test.describe('Mock Auth Flow', () => {
    test.beforeEach(async ({ context }, testInfo) => {
        await setMockAuthCookie(context, buildMockUser('mock-auth-flow', testInfo))
    })

    test('should redirect away from login with mock auth', async ({ page }) => {
        await page.goto('/login')

        // Mock-authenticated users should be redirected to the app home
        await expect(page).toHaveURL(/\/focus/)

        // Verify setup screen is visible
        await expect(page.getByRole('heading', { name: /1\. pick session tasks/i })).toBeVisible()
    })

    test('should navigate through session flow with mock auth', async ({ page }) => {
        await page.goto('/focus')

        // Should see the setup screen
        await expect(page.getByRole('heading', { name: /1\. pick session tasks/i })).toBeVisible()

        // Add a task
        await addTaskFromSetup(page, 'Mocked Auth Task')

        // Start session
        await page.getByRole('button', { name: /start session/i }).click()
        await expect(page).toHaveURL(/\/sessions\//, { timeout: 15000 })

        // Verify session view
        await expect(page.getByRole('heading', { name: 'Session Tasks', exact: true })).toBeVisible({ timeout: 15000 })
        await expect(page.getByRole('button', { name: /end session/i })).toBeVisible()
        await expect(page.getByRole('button', { name: /mocked auth task/i }).first()).toBeVisible()

        // Complete task
        await page.getByRole('button', { name: /mocked auth task/i }).first().click()
        await expect(page.getByText('1 of 1 filed')).toBeVisible()

        // End session
        await page.getByRole('button', { name: /end session/i }).click()
        const endToSummaryButton = page.getByRole('button', { name: /end and view summary/i })
        await expect(endToSummaryButton).toBeVisible()
        await endToSummaryButton.click()
        await expect(page).toHaveURL(/\/sessions\/.+\/summary$/, { timeout: 15000 })
        await expect(page.getByRole('heading', { name: /session filed/i })).toBeVisible({ timeout: 15000 })
    })
})
