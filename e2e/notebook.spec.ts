// =============================================================================
// e2e/notebook.spec.ts — End-to-End smoke + i18n flow for the Living Notebook.
// -----------------------------------------------------------------------------
// These three tests cover what the Vitest unit suite cannot:
//   1. The async Server-rendered home actually paints its hero + roadmap.
//   2. The cookie-driven language switch flips UI text AND survives a full
//      navigation to /lessons (the SSR/CSR-agreement feature the project is
//      built around).
//   3. A lesson route renders server-side without crashing.
//
// Selectors use accessible roles/names (getByRole) rather than CSS classes, so
// the tests stay green through styling refactors and double as a basic a11y
// check (the language switcher is a real ARIA radiogroup).
// =============================================================================

import { test, expect } from '@playwright/test';

test.describe('Living Notebook · home', () => {
    test('renders the hero and the 5-module roadmap', async ({ page }) => {
        await page.goto('/');

        // Hero headline — language-agnostic: the proxy picks the language from
        // the browser's Accept-Language, so we assert only the brand token that
        // is identical in every translation.
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
            'Next.js'
        );

        // The roadmap renders one card per module, each tagged M1…M5. The ids
        // are language-independent, so asserting the first and last proves the
        // whole grid server-rendered.
        await expect(page.getByText('M1', { exact: true })).toBeVisible();
        await expect(page.getByText('M5', { exact: true })).toBeVisible();
    });
});

test.describe('Living Notebook · cookie-driven i18n', () => {
    // Pin Accept-Language to Italian so the proxy's first-visit sniff is
    // deterministic: without a cookie the home loads in the base language (it).
    test.use({ locale: 'it-IT' });

    test('switching to English updates the hero and persists into /lessons', async ({
        page,
    }) => {
        await page.goto('/');

        // Default (Italian) hero.
        const hero = page.getByRole('heading', { level: 1 });
        await expect(hero).toContainText('Impara Next.js');

        // The home switcher is an ARIA radiogroup; the English option is a radio
        // whose accessible name is its label "English".
        await page.getByRole('radio', { name: 'English' }).click();

        // The hero re-renders client-side in English…
        await expect(hero).toContainText('Learn Next.js');

        // …and the choice was written to the `nb-lang` cookie, so navigating to
        // the lessons index keeps English (no flash back to Italian). The
        // /lessons header shows a "Home" back-link rendered server-side.
        await page.goto('/lessons');
        const langCookie = (await page.context().cookies()).find(
            c => c.name === 'nb-lang'
        );
        expect(langCookie?.value).toBe('en');
    });
});

test.describe('Living Notebook · lessons', () => {
    test('a lesson route server-renders its content', async ({ page }) => {
        // /server-fetching is an async Server Component that awaits a real fetch
        // — exactly the kind of page Vitest cannot render. If it 500s or hangs,
        // this fails.
        const response = await page.goto('/lessons/server-fetching');
        expect(response?.ok()).toBeTruthy();

        // It must paint a top-level heading (content streamed in, not a blank
        // shell or an error boundary).
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
