'use server';
// =============================================================================
// app/lessons/api-routes/_lib/actions.ts
// Server Actions for Module 4 · Lesson 1.
// -----------------------------------------------------------------------------
// 🧠 Why a Server Action and not a Route Handler
// We need to call `updateTag('now-static')` to bust the cache from a button
// click. Both Server Actions and Route Handlers can do that, but:
//
//   • A Server Action is the right tool when the caller is a Client Component
//     on the same domain — it gives us a zero-boilerplate POST round-trip
//     (no fetch, no JSON, no endpoint to keep in sync).
//   • A Route Handler is the right tool when the caller is external (curl,
//     webhook, other app), or when we need custom status codes / headers.
//
// Module 2 · Lesson 3 already taught this distinction; here we use the
// pattern to drive the cache-comparison lab in `cache-compare.tsx`.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md
// =============================================================================

import { updateTag } from 'next/cache';

// Evicts the `'use cache'` entry tagged `now-static`. Next request to
// /api/now-static will re-execute the helper and produce a fresh nonce.
export async function invalidateNowStaticAction(): Promise<void> {
    updateTag('now-static');
}
