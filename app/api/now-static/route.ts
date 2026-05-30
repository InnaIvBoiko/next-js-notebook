// =============================================================================
// app/api/now-static/route.ts
// GET /api/now-static → timestamp FROZEN by `'use cache'` + cacheTag.
// -----------------------------------------------------------------------------
// 🧠 The "static" half of the caching demo (Module 4 · Lesson 1).
//
// The cache primitive in Next 16's Cache Components mode is `'use cache'`,
// not `export const dynamic = 'force-static'` (that flag is REMOVED when
// Cache Components is enabled). The rules:
//
//   1) `'use cache'` CANNOT live directly inside the body of a Route
//      Handler — it must be extracted into a helper function.
//   2) The helper's return value is captured by the cache; subsequent calls
//      with the same arguments return the cached value.
//   3) `cacheLife()` controls how long the entry is considered fresh.
//   4) `cacheTag()` attaches a label that lets another part of the app call
//      `updateTag(label)` to evict this entry on demand.
//
// We use `cacheLife('max')` — revalidate every 30 days, expire after a year —
// so the cache is rock-solid for the duration of a study session. The student
// invalidates it CONTROLLED through the Server Action wired to the
// "Invalidate cache" button in the lab.
//
// ⚠️ Dev-mode caveat: in `next dev` an HMR event ALSO invalidates `'use cache'`
// entries (Hot Module Replacement refresh hash). So if you edit ANY file while
// the lab is open, the cache will silently regenerate. See use-cache docs.
//
// 📚 Docs:
//   node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
//   node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md
//   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheTag.md
// =============================================================================

import { cacheLife, cacheTag } from 'next/cache';

async function frozenTimestamp() {
    'use cache';
    cacheLife('max');
    cacheTag('now-static');
    return {
        kind: 'static' as const,
        now: new Date().toISOString(),
        unixMs: Date.now(),
        nonce: Math.random().toString(36).slice(2, 10),
    };
}

export async function GET() {
    return Response.json(await frozenTimestamp());
}
