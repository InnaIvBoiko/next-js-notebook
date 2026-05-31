// =============================================================================
// app/api/runtime-probe/route.ts
// GET /api/runtime-probe — returns runtime + platform info.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// The runtime probe is the simplest possible "this is who I am" endpoint:
// it inspects `process.*` and known platform env vars and reports them.
//
// 🧠 NODE BY DEFAULT
// Cache Components mode (next.config.ts → cacheComponents: true) disallows
// the `export const runtime` route-segment config — route handlers run on
// Node by default in this notebook, which is what we need (we read
// process.versions.node, process.uptime(), process.env.*). If you flipped
// the project off Cache Components and wanted Edge for /api/geo etc., you'd
// add `export const runtime = 'edge'` on THAT route.
//
// 🧠 CORS — needed because the lab fetches THIS endpoint from the deployed
// origin while the user is viewing it on localhost (the cross-origin tab
// is the dev browser). Without CORS the browser blocks the response.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers-and-middleware.md
// =============================================================================

const CORS_HEADERS = {
    // The lab calls this endpoint from any origin (local viewing the live
    // deploy, or vice versa). The endpoint exposes only platform metadata —
    // safe to allow from anywhere.
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // No cache: every hit must reflect the current uptime + env.
    'Cache-Control': 'no-store',
};

export async function GET() {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

    const body = {
        // Hard-coded because `export const runtime` above commits us to Node.
        // We expose it so the lab can show "runtime: nodejs" explicitly.
        runtime: 'nodejs' as const,
        nodeVersion: process.versions?.node ?? null,
        timestamp: new Date().toISOString(),
        // `process.uptime()` returns seconds since this Node process started.
        // On Vercel Serverless this counts since cold start — useful proof
        // that two consecutive calls hit the same instance (uptime grows)
        // or a fresh one (uptime resets to a small number).
        uptimeSeconds: typeof process.uptime === 'function' ? process.uptime() : null,
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: {
            env: process.env.VERCEL_ENV ?? null, // 'production' | 'preview' | 'development'
            region: process.env.VERCEL_REGION ?? null, // e.g. 'fra1', 'iad1'
            url: process.env.VERCEL_URL ?? null, // e.g. 'next-js-notebook-abc.vercel.app'
            sha,
            sha7: sha ? sha.slice(0, 7) : null,
            branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        },
    };

    return Response.json(body, { headers: CORS_HEADERS });
}

// CORS preflight — browsers send OPTIONS before a cross-origin GET in some
// cases. Respond 204 with the same headers.
export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}
