// =============================================================================
// app/api/webhook/route.ts
// HMAC-signed webhook receiver. Used by Module 5 · Lesson 3 (/security-env).
// -----------------------------------------------------------------------------
// 🧠 THE PATTERN
// Stripe, GitHub, Slack, Twilio — every serious webhook provider signs the
// request body with a shared secret and sends the signature in a header.
// The receiver must:
//   1. Read the RAW request body (string, not parsed JSON — every byte
//      matters for the HMAC).
//   2. Compute its own HMAC-SHA256 over that body using the shared secret.
//   3. Compare its computed signature with the one in the header IN
//      CONSTANT TIME (constant-time = no early exit on first mismatched
//      byte — this defeats timing attacks where an attacker measures
//      response time to guess the secret byte by byte).
//   4. Reject (401) on mismatch BEFORE doing anything with the payload.
//
// 🧠 WHY EDGE-LIKE PRIMITIVES (`crypto.subtle`)
// Web Crypto's `crypto.subtle.sign('HMAC', …)` works identically on Node,
// Edge runtimes, Cloudflare Workers, and Deno. Sticking to it means the
// route can be moved to `runtime: 'edge'` later without touching code.
//
// 🧠 NO 'use server', NO Server Action
// This is a public webhook endpoint. Server Actions would be wrong here:
// they require the App's CSRF tokens and only accept calls from the App's
// own React tree. Webhooks come from STRIPE, not from your React app —
// they need a plain Route Handler with explicit signature verification.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers-and-middleware.md
// 📚 Stripe: https://stripe.com/docs/webhooks/signatures
// =============================================================================

import {
    signPayload,
    timingSafeEqual,
} from '@/app/lessons/security-env/_lib/server-only-secret';

// 🧠 NO `export const runtime` / `export const dynamic`
// Under `nextConfig.cacheComponents: true` (enabled in Module 2 · Lesson 2)
// the legacy segment-config exports (`runtime`, `dynamic`, `revalidate`, …)
// are off-limits — Cache Components has its own opt-in semantics. Route
// Handlers that read the request body are implicitly request-time anyway,
// no opt-out needed. We keep the Node runtime (default) which is fine for
// `crypto.subtle` — the same code would also work on Edge if you ever move it.

const SIGNATURE_HEADER = 'x-nb-signature';

export async function POST(request: Request) {
    // 1. Pull the signature the caller claims is theirs.
    const claimedSignature = request.headers.get(SIGNATURE_HEADER);
    if (!claimedSignature) {
        return Response.json(
            { error: `Missing ${SIGNATURE_HEADER} header` },
            { status: 400 },
        );
    }

    // 2. Read the body as RAW text. We MUST sign the original byte stream,
    // not a re-serialised JSON — JSON.stringify is non-deterministic about
    // whitespace and key order. Webhook providers always sign the wire body.
    const body = await request.text();

    // 3. Recompute the expected signature.
    const expectedSignature = await signPayload(body);

    // 4. Constant-time compare. `===` would leak timing information.
    if (!timingSafeEqual(claimedSignature, expectedSignature)) {
        return Response.json(
            {
                error: 'Invalid signature',
                hint: 'Compute HMAC-SHA256 of the raw body using WEBHOOK_SECRET, hex-encode it, and send it in the x-nb-signature header.',
            },
            { status: 401 },
        );
    }

    // 5. Only now is it safe to parse + act on the payload.
    let payload: unknown = null;
    try {
        payload = JSON.parse(body);
    } catch {
        return Response.json(
            { error: 'Body must be valid JSON once verified' },
            { status: 400 },
        );
    }

    // In a real handler: dispatch to a job queue, persist the event,
    // ack-fast (under 5s — webhook providers retry on timeout).
    return Response.json({
        ok: true,
        receivedAt: new Date().toISOString(),
        bytesSigned: body.length,
        echo: payload,
    });
}

// GET is handy for sanity-checking the route is mounted. NEVER expose any
// secret here — only a benign description.
export async function GET() {
    return Response.json({
        endpoint: '/api/webhook',
        method: 'POST',
        signatureHeader: SIGNATURE_HEADER,
        algorithm: 'HMAC-SHA256 over the raw JSON body',
        contentType: 'application/json',
        docs: '/lessons/security-env',
    });
}
