// =============================================================================
// app/lessons/security-env/_lib/server-only-secret.ts
// A "secret" module that demonstrates the `server-only` guard.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS FILE TEACHES
// In a real app, this would be a database driver, a connection pool, an SDK
// client holding an API key — anything that reads a secret from `env`.
// We simulate that here by returning a string derived from `WEBHOOK_SECRET`
// (still secret-derived, but harmless to display in a lab).
//
// 🧠 THE GUARD
// The top-level `import 'server-only'` is a build-time tripwire. If ANY
// `'use client'` file imports this module (directly or transitively), Turbopack
// throws at build time with a message like:
//
//   You're importing a component that needs "server-only". That only works
//   in a Server Component which is not supported in the pages/ directory.
//
// In production this saves you from inadvertently shipping a DB driver +
// connection string to the browser bundle — a class of bug that has cost
// real companies real money.
//
// 🧠 WHY NOT JUST PUT IT IN A SERVER ACTION?
// You can, and many apps do. But shared lib code (auth clients, DB clients)
// is reused across many entry points; one accidental import from a Client
// island would leak the whole chain. `server-only` is the belt to the
// suspenders.
// =============================================================================

import 'server-only';
import { env } from './env';

// In a real codebase: `db.connect({ connectionString: env.DATABASE_URL })`,
// `stripe = new Stripe(env.STRIPE_SECRET_KEY)`, etc. Here we just compute
// something deterministic from the secret to prove the module loaded.
export async function getServerSecretFingerprint(): Promise<string> {
    // SHA-256 the first 4 chars of the secret. Same input → same fingerprint.
    // We display only the fingerprint, never the secret itself.
    const data = new TextEncoder().encode(env.WEBHOOK_SECRET.slice(0, 4));
    const hash = await crypto.subtle.digest('SHA-256', data);
    // Hex-encode the first 8 bytes — enough to be distinctive, short enough
    // for a UI badge.
    return Array.from(new Uint8Array(hash).slice(0, 8))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// HMAC-SHA256 helper used by /api/webhook to verify incoming signatures.
// Lives here (server-only) because it embeds the secret in the operation.
export async function signPayload(
    payload: string,
    secret: string = env.WEBHOOK_SECRET,
): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(payload),
    );
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// Constant-time comparison — a real HMAC verifier MUST use this, not `===`,
// to defeat timing attacks. Branch-free over the full length of both inputs.
export function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}
