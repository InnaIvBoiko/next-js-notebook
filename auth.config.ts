// =============================================================================
// auth.config.ts
// EDGE-SAFE half of the Auth.js v5 configuration.
// -----------------------------------------------------------------------------
// 🧠 Why split (the cornerstone pattern of Auth.js v5)
// `middleware.ts` runs on the EDGE runtime, which forbids Node-only APIs
// (bcryptjs, native Drizzle drivers, PGlite WASM). The full `auth.ts`
// imports those — so middleware can't import the full config. The split:
//
//   auth.config.ts  ← edge-safe: provider list + callbacks (this file)
//   auth.ts         ← full: imports config + adds Credentials + DrizzleAdapter
//   middleware.ts   ← imports config + creates a slim NextAuth instance
//
// 🧠 What's safe to put here
// • Provider declarations that DON'T need DB / hashing in `authorize`
//   → GitHub OAuth (only redirects + token exchange, no Node)
// • `callbacks.authorized` (used by middleware to gate routes)
// • `pages` (custom signin URL)
// • `session` strategy settings
//
// 🧠 What MUST stay out of here
// • DrizzleAdapter (uses PGlite WASM → not edge-safe)
// • Credentials provider with bcrypt.compare in authorize() (bcrypt → Node)
//
// 📚 Doc: https://authjs.dev/guides/edge-compatibility
// =============================================================================

import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
    // The route handler in app/api/auth/[...nextauth]/route.ts mounts at
    // /api/auth/*. `pages.signIn` redirects unauthenticated users coming
    // through middleware to our lesson page instead of the default Auth.js
    // hosted form.
    pages: {
        signIn: '/lessons/auth-setup',
    },

    providers: [
        GitHub({
            // 🧠 `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` are auto-picked from
            // env. If missing, GitHub login simply doesn't work — the rest of
            // the lesson (Credentials) still works. See .env.example.
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
    ],

    callbacks: {
        // `authorized` is the gatekeeper called by middleware on every
        // request the matcher catches. Return true → allow, false → redirect
        // to `pages.signIn`. Return a Response → override the redirect.
        //
        // For THIS notebook we keep the policy lenient: anyone can browse
        // any route. The lesson teaches PER-COMPONENT guarding via the
        // `auth()` helper instead of route-level lockdown.
        async authorized({ auth, request }) {
            // Future option: gate `/lessons/auth-setup/protected/*` here.
            const isLoggedIn = !!auth?.user;
            const path = request.nextUrl.pathname;

            // Example we could enable later:
            //   if (path.startsWith('/admin') && !isLoggedIn) return false;

            // Suppress lint for the unused vars while keeping the names
            // descriptive — they're the documented `authorized` signature.
            void isLoggedIn;
            void path;
            return true;
        },
    },
};
