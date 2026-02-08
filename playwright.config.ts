
import { defineConfig, devices } from '@playwright/test'

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: `npm run dev -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        env: {
            NEXT_PUBLIC_E2E_TESTING: 'true',
            NEXT_PUBLIC_MOCK_AUTH_USER_ID: 'e2e-mock-user-id',
            NEXT_PUBLIC_MOCK_AUTH_USER_EMAIL: 'tester@example.com',
            NEXT_PUBLIC_MOCK_AUTH_USER_NAME: 'E2E Tester',
        },
    },
})
