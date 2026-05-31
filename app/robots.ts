// =============================================================================
// app/robots.ts
// Typed robots.txt — file convention at the root of `app`.
// -----------------------------------------------------------------------------
// 🧠 RESULT
// At build time Next turns this into a route at `/robots.txt` that returns
// text/plain. The output matches the Robots Exclusion Standard format.
//
// 🧠 WHY TYPE THE FILE INSTEAD OF SHIPPING robots.txt
//   • Typecheck: a typo in `Disallow` becomes a TS error, not a silent
//     production bug.
//   • Logic: easy to gate rules by `NODE_ENV` — keep staging out of
//     Google's index without committing two files.
//   • Single source of truth: import the BASE URL from one place and the
//     `Sitemap:` line stays in sync with `sitemap.ts`.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md
// =============================================================================

import type { MetadataRoute } from 'next';

// In production this would come from `process.env.NEXT_PUBLIC_SITE_URL`. We
// keep the literal to make the lesson self-contained.
const BASE_URL = 'https://living-notebook.local';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    // Internal API surface — never useful to crawlers.
                    '/api/',
                    // Build output and HMR — leaked at dev time only, but
                    // belt-and-braces.
                    '/_next/',
                    // The gated demo subtree from Module 4 · Lesson 4.
                    '/lessons/*/protected',
                ],
            },
        ],
        // ALWAYS point crawlers at the sitemap. Google, Bing, and Yandex
        // discover the sitemap via robots.txt before requesting it.
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
