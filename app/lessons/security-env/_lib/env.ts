// =============================================================================
// app/lessons/security-env/_lib/env.ts
// Typed + validated environment variables. Single source of truth for the app.
// -----------------------------------------------------------------------------
// 🧠 import 'server-only'
// This module READS `process.env.WEBHOOK_SECRET` — a server-side secret. If
// it were ever bundled into a Client Component, the value would be inlined
// into JS the browser downloads → instant credentials leak.
//
// The `server-only` package is a *tripwire*: importing it from a "use client"
// file makes the build fail with a clear message ("You're importing a
// component that needs server-only. It only works in a Server Component but
// one of its parents is marked with use client"). Defense in depth: the
// convention of `_lib` + the bundler's tree-shaking + this guard.
//
// 🧠 zod validation AT BOOT
// `envSchema.parse(process.env)` runs the FIRST time this module is imported
// on the server. If a required variable is missing or malformed, the parse
// throws synchronously → the Next dev server logs a clear stack trace and
// the production build fails fast. Better than discovering the bug at 3am
// when the webhook endpoint silently returns 500s.
//
// 🧠 NEXT_PUBLIC_*
// Variables prefixed with `NEXT_PUBLIC_` are inlined at build time into both
// server AND client bundles. EVERY visitor's JS will contain the value.
// → never put secrets here. Use this prefix only for things that are SAFE
// to be world-readable: site name, public API base URL, feature flags.
// =============================================================================

import 'server-only';
import { z } from 'zod';

// -----------------------------------------------------------------------------
// Schema — describe each env var with type + constraints. zod handles parsing
// (numbers, booleans, URLs) and produces a typed object via `z.infer`.
// -----------------------------------------------------------------------------
const envSchema = z.object({
    // Webhook HMAC secret — used by /api/webhook to verify incoming signatures.
    // Min length 16 to discourage trivially short secrets.
    WEBHOOK_SECRET: z
        .string()
        .min(16, 'WEBHOOK_SECRET must be at least 16 characters'),

    // Auth.js secret — shared with `auth.config.ts`. We validate it here for
    // completeness so the lesson's env inspector can show the WHOLE picture.
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 chars'),

    // Node environment — used by proxy.ts to switch CSP behaviour
    // (strict in production, relaxed in dev so Turbopack HMR keeps working).
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // PUBLIC variables — safe to ship to the browser. These prove the
    // `NEXT_PUBLIC_` mechanic in the lesson's env inspector.
    NEXT_PUBLIC_SITE_NAME: z.string().default('Living Notebook'),
    NEXT_PUBLIC_FEATURE_BETA: z
        .string()
        .transform((v) => v === 'true')
        .default(false),
});

// `z.infer` extracts the static TS type from the schema. Anywhere we import
// `env`, autocomplete shows the validated shape — typos at the call site
// become TS errors.
export type Env = z.infer<typeof envSchema>;

// `parse` throws on the first failure. We let it throw at import time so the
// dev server / build crashes loudly with the exact field that's missing or
// invalid — no silent fall-through into "undefined", no `?` ambiguity.
// `safeParse` exists if you want to handle failures yourself (e.g. for a
// preview environment with looser requirements).
function loadEnv(): Env {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        // Pretty-print the issues for the dev log; the throw also includes
        // them, but the formatted version is what makes the error scannable.
        const issues = parsed.error.issues
            .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(
            `[env] Invalid environment variables:\n${issues}\n\n` +
                `Check .env.local against app/lessons/security-env/_lib/env.ts`,
        );
    }
    return parsed.data;
}

// Single shared instance. Subsequent imports of this module hit the Node
// module cache, so the parse runs exactly once per server process.
export const env: Env = loadEnv();
