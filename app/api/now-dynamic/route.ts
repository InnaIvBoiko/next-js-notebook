// =============================================================================
// app/api/now-dynamic/route.ts
// GET /api/now-dynamic → fresh timestamp on every request.
// -----------------------------------------------------------------------------
// 🧠 The "dynamic" half of the caching demo (Module 4 · Lesson 1).
// We touch `Date.now()` and `Math.random()` directly inside the GET body.
// These are non-deterministic — Next can't prerender them — so the handler
// is forced to run at request time. Every call returns a brand-new value.
//
// In Cache Components mode (next.config.ts → `cacheComponents: true`), this
// is the DEFAULT behaviour for GET handlers anyway: dynamic until you opt
// into caching with `'use cache'`. Don't try `export const dynamic = ...` —
// that segment-config option is REMOVED when Cache Components is enabled.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
// =============================================================================

export async function GET() {
    return Response.json({
        kind: 'dynamic',
        now: new Date().toISOString(),
        unixMs: Date.now(),
        nonce: Math.random().toString(36).slice(2, 10),
    });
}
