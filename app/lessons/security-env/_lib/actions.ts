'use server';
// =============================================================================
// app/lessons/security-env/_lib/actions.ts
// Server Actions for Lab 4 (webhook). Bridge between the Client demo and
// the server-only secret without ever shipping the secret to the browser.
// -----------------------------------------------------------------------------
// 🧠 SIGNING ORACLE PATTERN
// The Lab 4 UI needs a valid HMAC signature to POST to /api/webhook. We
// CANNOT compute it on the Client because that would mean shipping the
// secret to the browser (the whole point of the lesson). Instead the
// Client calls this Server Action, the Action signs the payload using
// the server-only secret, and returns ONLY the signature. The secret
// itself stays inside the server bundle.
//
// This is also the pattern you'd use in production for "Sign a download URL",
// "Sign a webhook for testing", "Sign a JWT for the client".
// =============================================================================

import { signPayload } from './server-only-secret';

// Server Action signature: takes a string payload, returns the hex HMAC.
// Marked async, lives behind `'use server'` → React serializes the call as
// a POST to a Next-managed endpoint, automatically protected against CSRF.
export async function signForWebhookDemo(payload: string): Promise<string> {
    return signPayload(payload);
}

// Returns an INTENTIONALLY WRONG signature so Lab 4 can demo the 401 path.
// Same length as a real HMAC-SHA256 hex string (64 chars) so the wire shape
// looks identical — only the bytes are wrong.
export async function tamperedSignature(): Promise<string> {
    return 'de'.repeat(32); // 64-char hex, deterministic, obviously wrong
}
