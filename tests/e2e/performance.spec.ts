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

    test('Session Join Latency should be < 6s in dev', async ({ page }) => {
        // 1. Go to setup page
        await page.goto('/focus');
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

        // Dev-mode runtime with first-hit compilation can be slower than production.
        expect(duration).toBeLessThan(6000);
    });

    test('Focus Setup Hydration Latency', async ({ page }) => {
        const start = Date.now();
        await page.goto('/focus');
        await expect(page.getByText(/1\. Declutter Your Mind/i)).toBeVisible();
        const end = Date.now();

        const latency = end - start;
        console.log(`⏱️ Focus Setup Load & Hydrate: ${latency}ms`);

        // Dev-mode runtime with first-hit compilation can be slower than production.
        expect(latency).toBeLessThan(6000);
    });
});
