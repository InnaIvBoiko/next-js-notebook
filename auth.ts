// =============================================================================
// auth.ts
// FULL Auth.js v5 configuration — Node-runtime only.
// -----------------------------------------------------------------------------
// 🧠 What this file does
// Imports the edge-safe `authConfig` and ADDS:
//   • DrizzleAdapter wired to our PGlite instance
//   • Credentials provider (with bcrypt.compare in authorize)
//   • Mixed session strategy: GitHub OAuth → database; Credentials → JWT
//     (Auth.js v5 forces JWT whenever a Credentials provider is present —
//     this is a hard documented constraint, not a choice we made)
//
// What we EXPORT:
//   • `auth`     — universal session reader: works in RSCs, Server Actions,
//                  Route Handlers, middleware. The cornerstone API of v5.
//   • `signIn`   — server-side trigger for any provider
//   • `signOut`  — server-side sign-out helper
//   • `handlers` — { GET, POST } for the catch-all /api/auth/[...nextauth]
//
// 🧠 Why session.strategy = 'jwt' even though we wanted database sessions
//
// Auth.js v5 reads sessions UNIFORMLY based on `session.strategy`. With
// 'database', `auth()` looks up the cookie value as a row in the `session`
// table. Credentials provider, however, NEVER creates a session row (it
// can't — the adapter contract is OAuth-shaped). It just issues a JWT
// cookie. Result with 'database' strategy: signin succeeds, cookie is set,
// but every subsequent `auth()` returns null because no session row exists.
//
// The pragmatic fix is `strategy: 'jwt'` globally. Effects:
//   • Both Credentials and GitHub OAuth produce JWT cookies
//   • The DrizzleAdapter still stores users + accounts + verificationTokens
//     in PGlite — sign-up history and account links remain visible
//   • The `session` table stays empty for everyone (sessions live in cookies)
//   • We lose the "revoke session by deleting the row" capability — that's
//     the documented trade-off
//
// 📚 Doc: https://authjs.dev/getting-started/installation
// 📚 Doc: https://authjs.dev/getting-started/authentication/credentials
// =============================================================================

import 'server-only';

import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './app/_db/client';
import { users } from './app/_db/schema';
import { authConfig } from './auth.config';

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,

    // Drizzle adapter wraps our PGlite instance. With strategy='jwt' the
    // adapter still creates/reads `user`, `account`, `verificationToken`
    // rows — only the `session` table goes unused (sessions live in the
    // JWT cookie). See file header for why.
    adapter: DrizzleAdapter(db),

    // JWT strategy required for Credentials compatibility (see file header).
    session: { strategy: 'jwt' },

    // 🧠 With JWT strategy + DrizzleAdapter, Auth.js DOESN'T auto-populate
    // session.user.id — we need to bridge it manually. `jwt` callback runs
    // on sign-in (when `user` is defined) and on every subsequent request
    // (token only); `session` callback hands the token data to React.
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            // Persist the DB user id on the token at sign-in time.
            if (user?.id) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Expose token.id as session.user.id so callers can write
            // `session.user.id` everywhere (RSC, Server Action, Route Handler).
            if (token.id && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },

    providers: [
        // Re-spread the GitHub provider from the edge config so this list is
        // the SINGLE source of truth at runtime.
        ...authConfig.providers,

        // 🧠 Credentials provider — bcrypt verification against `password_hash`
        // The `authorize` callback runs on NODE (this file is `server-only`),
        // so bcryptjs is fine. The return value shape is { id, email, name }
        // — Auth.js stores those on the session.user object.
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email =
                    typeof credentials?.email === 'string'
                        ? credentials.email.trim().toLowerCase()
                        : '';
                const password =
                    typeof credentials?.password === 'string'
                        ? credentials.password
                        : '';
                if (email.length === 0 || password.length === 0) return null;

                const user = await db.query.users.findFirst({
                    where: eq(users.email, email),
                });
                // No user, or this user signed up via OAuth (no passwordHash)
                // → reject silently. Returning `null` triggers Auth.js's
                // "Invalid credentials" generic error — we don't leak whether
                // the email exists.
                if (!user || !user.passwordHash) return null;

                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email ?? undefined,
                    name: user.name ?? undefined,
                    image: user.image ?? undefined,
                };
            },
        }),
    ],
});
