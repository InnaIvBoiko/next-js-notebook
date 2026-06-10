// =============================================================================
// vitest.config.mts — Unit test runner for the Living Notebook.
// -----------------------------------------------------------------------------
// Per the official Next.js 16 guide (node_modules/next/dist/docs/01-app/
// 02-guides/testing/vitest.md). `vite-tsconfig-paths` teaches Vitest the `@/*`
// alias from tsconfig.json so test imports match app imports. `jsdom` gives a
// browser-like global so React Testing Library can render Client Components.
//
// NOTE: async Server Components are not yet supported by Vitest (React
// limitation). We unit-test pure `_lib` logic + sync components here, and rely
// on the live deploy / manual labs for async Server Component behaviour.
// =============================================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Native tsconfig `paths` resolution (replaces the vite-tsconfig-paths
    // plugin) so test imports honour the `@/*` alias from tsconfig.json.
    resolve: { tsconfigPaths: true },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['**/*.{test,spec}.{ts,tsx}'],
        // `e2e/` holds Playwright specs (also *.spec.ts) — they import
        // `@playwright/test`, not Vitest, so they must be excluded here.
        exclude: ['node_modules', '.next', 'e2e'],
    },
});
