import { test, expect } from '@playwright/test';

// Standard mock user for E2E
const MOCK_USER = {
    id: 'perf-tester-id',
    email: 'perf@example.com',
    name: 'Performance Tester'
};

test.describe('Performance Benchmarks', () => {
    test.beforeEach(async ({ context }) => {
        // Set mock auth cookie
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

    test('Session Join Latency should be < 2s', async ({ page }) => {
        // 1. Go to setup page
        await page.goto('/admin-mode');
        await expect(page.getByRole('button', { name: /start session/i })).toBeVisible();

        // 2. Clear performance marks
        await page.evaluate(() => performance.clearMarks());

        // 3. Mark start and click join
        await page.evaluate(() => performance.mark('join-start'));
        await page.getByRole('button', { name: /start session/i }).click();

        // 4. Wait for the session view to be fully rendered
        // We look for the hourglass timer or the tasks list
        await expect(page.getByText(/Today's Tasks/i)).toBeVisible();
        await page.evaluate(() => performance.mark('join-end'));

        // 5. Calculate duration
        const duration = await page.evaluate(() => {
            performance.measure('join-duration', 'join-start', 'join-end');
            return performance.getEntriesByName('join-duration')[0].duration;
        });

        console.log(`⏱️ Session Join Latency: ${duration.toFixed(2)}ms`);

        // PRD Requirement: < 2000ms
        expect(duration).toBeLessThan(2000);
    });

    test('Dashboard Hydration Latency', async ({ page }) => {
        const start = Date.now();
        await page.goto('/dashboard');
        await expect(page.getByText(/Insights & History/i)).toBeVisible();
        const end = Date.now();

        const latency = end - start;
        console.log(`⏱️ Dashboard Load & Hydrate: ${latency}ms`);

        // Target: < 3s for full interactive dashboard
        expect(latency).toBeLessThan(3000);
    });
});
