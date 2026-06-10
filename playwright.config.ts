// =============================================================================
// playwright.config.ts — End-to-End test runner for the Living Notebook.
// -----------------------------------------------------------------------------
// Per the official Next.js 16 guide (node_modules/next/dist/docs/01-app/
// 02-guides/testing/playwright.md).
//
// WHY E2E in addition to Vitest: async Server Components are not yet unit-
// testable under Vitest (a React limitation, noted in vitest.config.mts). The
// notebook's most important behaviours are exactly those — server-rendered
// pages and the cookie-driven i18n that has to agree between SSR and the
// client. Playwright drives a real browser against a real server, so it covers
// the gap the unit suite leaves open.
//
// The `webServer` block lets Playwright boot the app itself:
//   - CI runs against the PRODUCTION build (`npm run start`) — closest to how
//     the app behaves on Vercel (the Next docs recommend testing prod code).
//   - Locally it runs the dev server and reuses one you already have open.
// Either way Playwright waits until http://localhost:3000 answers before the
// first test runs.
// =============================================================================

import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
    // E2E specs live in their own folder so Vitest (which globs *.spec.ts) never
    // tries to run them — see the `exclude` in vitest.config.mts.
    testDir: './e2e',

    // Fail the CI build if a `test.only` was committed by mistake.
    forbidOnly: !!process.env.CI,
    // Flaky-test insurance on CI only; locally a failure is a real failure.
    retries: process.env.CI ? 2 : 0,
    // One worker on CI for deterministic ordering; parallel locally.
    workers: process.env.CI ? 1 : undefined,

    // GitHub annotations in CI, a human-readable list locally.
    reporter: process.env.CI
        ? [['github'], ['html', { open: 'never' }]]
        : 'list',

    use: {
        baseURL, // lets specs call page.goto('/') instead of the full URL
        trace: 'on-first-retry', // capture a trace only when a retry kicks in
    },

    // Chromium only: keeps CI fast and avoids installing WebKit/Firefox system
    // deps. The behaviours under test (routing, cookies, hydration) are engine-
    // agnostic; add more projects here if cross-browser coverage is needed.
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: {
        command: process.env.CI ? 'npm run start' : 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
