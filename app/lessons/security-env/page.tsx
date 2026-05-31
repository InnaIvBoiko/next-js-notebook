// =============================================================================
// app/lessons/security-env/page.tsx
// SERVER entry for /lessons/security-env — Module 5 · Lesson 3.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS PAGE READS SERVER-SIDE BEFORE RENDERING
//   • The typed `env` object (validated by zod at boot) — so the env inspector
//     can show which values are populated, which are public, which are secret.
//   • The current request's headers — for the headers inspector to show the
//     CSP, HSTS, X-Frame-Options, x-nonce live values.
//   • The server-secret fingerprint — a hash of the first 4 chars of
//     WEBHOOK_SECRET to PROVE the page loaded a server-only module without
//     revealing the secret itself.
//
// 🧠 NONCE
// The proxy.ts writes a fresh nonce to `x-nonce` on every request. We pass
// it down to the CSP demo so the "allowed" button can use it on a <Script>
// tag — proving that nonce-tagged scripts run while inline-no-nonce ones
// get blocked by the CSP.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import IndexView from './_components/index-view';
import EnvInspector from './_components/env-inspector';
import HeadersInspector from './_components/headers-inspector';
import CspDemo from './_components/csp-demo';
import WebhookDemo from './_components/webhook-demo';
import { env } from './_lib/env';
import { getServerSecretFingerprint } from './_lib/server-only-secret';

export const metadata: Metadata = {
    title: 'Env & Security · Living Notebook',
    description:
        'Module 5 · Lesson 3: zod-typed env at boot, server-only tripwire, static security headers, dynamic CSP with per-request nonce via proxy.ts, HMAC-signed webhook with constant-time verification.',
};

// Pattern shared with the other request-time lessons (auth-setup,
// middleware-logic, seo-metadata/[slug]): a thin async inner Component
// behind <Suspense> so Cache Components is happy with our headers() reads.
export default function SecurityEnvPage() {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PageContent />
        </Suspense>
    );
}

async function PageContent() {
    // Escape hatch: marks this branch as request-time so headers() works.
    await connection();

    const headerStore = await headers();
    const fingerprint = await getServerSecretFingerprint();

    // Snapshot of the relevant headers — the inspector renders them as cards.
    const headerSnapshot = {
        csp:
            headerStore.get('content-security-policy') ??
            headerStore.get('content-security-policy-report-only') ??
            '',
        // The static headers from next.config.ts aren't request-injected — they're
        // applied by Next AFTER the page renders, so headers() can't see them.
        // We hard-code their VALUES from the config (mirroring what the user
        // will see in DevTools → Network). Single source of truth note: if you
        // change next.config.ts, update these too.
        hsts: 'max-age=31536000; includeSubDomains; preload',
        xFrame: 'DENY',
        referrer: 'strict-origin-when-cross-origin',
        permissions: 'camera=(), microphone=(), geolocation=(), payment=()',
        // The nonce IS request-injected by proxy.ts — comes through.
        nonce: headerStore.get('x-nonce') ?? '',
    };

    // PUBLIC env values (NEXT_PUBLIC_*) — these match what the Client island
    // will also see via `process.env`. The env inspector renders both columns
    // and the user can compare.
    const publicEnv = {
        NEXT_PUBLIC_SITE_NAME: env.NEXT_PUBLIC_SITE_NAME,
        NEXT_PUBLIC_FEATURE_BETA: env.NEXT_PUBLIC_FEATURE_BETA,
    };

    // SERVER-ONLY env values — show LENGTH only, never the value itself.
    // The fingerprint proves the server CAN read the secret without ever
    // putting bytes of it on the wire.
    const serverEnv = {
        WEBHOOK_SECRET: {
            length: env.WEBHOOK_SECRET.length,
            fingerprint,
        },
        AUTH_SECRET: {
            length: env.AUTH_SECRET.length,
        },
        NODE_ENV: env.NODE_ENV,
    };

    return (
        <IndexView
            envInspector={
                <EnvInspector
                    key='env-inspector'
                    publicEnv={publicEnv}
                    serverEnv={serverEnv}
                />
            }
            headersInspector={
                <HeadersInspector
                    key='headers-inspector'
                    headers={headerSnapshot}
                />
            }
            cspDemo={
                <CspDemo
                    key='csp-demo'
                    nonce={headerSnapshot.nonce}
                />
            }
            webhookDemo={<WebhookDemo key='webhook-demo' />}
        />
    );
}

function LessonSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-7 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-2/3 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}
