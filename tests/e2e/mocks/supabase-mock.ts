import { Page } from '@playwright/test';

/**
 * Mocks Supabase Auth requests in the browser.
 * Note: This only works for client-side calls. 
 * Since our app uses Server Actions/API routes for auth, we also need to handle those.
 */
export async function mockSupabaseAuth(page: Page) {
    // Intercept API calls to /api/auth/register
    await page.route('**/api/auth/register', async (route) => {
        if (route.request().method() === 'POST') {
            const body = route.request().postDataJSON();
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: "User registered successfully",
                    user: {
                        id: 'mock-user-id',
                        email: body.email,
                    },
                }),
            });
        } else {
            await route.continue();
        }
    });

    // Intercept login requests (Server Action call might be harder to intercept directly by URL 
    // as it's a POST to the same page, but we can intercept the underlying fetch if it targets an API)
    // Actually, 'authenticate' in actions.ts is a Server Action. 
    // Next.js Server Actions go to the current URL with specific headers.

    await page.route(/\/login|\/register/, async (route) => {
        const headers = route.request().headers();
        if (headers['next-action']) {
            // This is a Server Action!
            // We can't easily mock the server's response here because the server is the one talking to Supabase.
            // To mock this, we'd need to mock the Supabase calls inside the Next.js server.
            await route.continue();
        } else {
            await route.continue();
        }
    });
}
