// =============================================================================
// app/api/server-time/route.ts
// GET /api/server-time — returns the current server timestamp.
// Used by the Polling demo to show useQuery's `refetchInterval` in action.
// -----------------------------------------------------------------------------
// 🧠 Cache Components mode
// In Next 16 with cacheComponents: true (Module 2 · Lesson 2), route segment
// configs like `export const dynamic = 'force-dynamic'` are forbidden. Route
// handlers are dynamic by default — every request runs `GET()` afresh, which
// is exactly what we want here (a real timestamp on every call).
// =============================================================================

export async function GET() {
    return Response.json({
        now: new Date().toISOString(),
        unixMs: Date.now(),
    });
}
