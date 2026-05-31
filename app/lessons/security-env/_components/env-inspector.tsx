'use client';
// =============================================================================
// app/lessons/security-env/_components/env-inspector.tsx
// Side-by-side: Server env vs Client env. PROVES the boundary visually.
// -----------------------------------------------------------------------------
// 🧠 THE EXPERIMENT
// The Server column is what the page COULD read — including secrets — shown
// as length + fingerprint only. The Client column reads `process.env` from
// INSIDE a `'use client'` file: any access to a non-NEXT_PUBLIC_* var here
// returns `undefined` because Turbopack didn't inline it. That's the wall.
//
// Browser DevTools follow-up: Sources → Cmd+Shift+F → search for the first 4
// chars of WEBHOOK_SECRET in the bundle. Zero hits → secret is server-only.
// Search for "Living Notebook" → hits → NEXT_PUBLIC_SITE_NAME is inlined.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type ServerEnvSnapshot = {
    WEBHOOK_SECRET: { length: number; fingerprint: string };
    AUTH_SECRET: { length: number };
    NODE_ENV: 'development' | 'production' | 'test';
};

type Props = {
    publicEnv: {
        NEXT_PUBLIC_SITE_NAME: string;
        NEXT_PUBLIC_FEATURE_BETA: boolean;
    };
    serverEnv: ServerEnvSnapshot;
};

export default function EnvInspector({ publicEnv, serverEnv }: Props) {
    const lang = useLang();
    const t = content[lang].labs.env;

    // -------------------------------------------------------------------
    // 🚨 NEVER REFERENCE A NON-NEXT_PUBLIC_ ENV VAR FROM A CLIENT COMPONENT
    // -------------------------------------------------------------------
    // Even though `process.env.WEBHOOK_SECRET` resolves to `undefined` in
    // the BROWSER (Turbopack only inlines NEXT_PUBLIC_* vars), this same
    // module ALSO runs on the SERVER during SSR. There `process.env` is
    // the real Node `process.env` — populated from `.env.local` — and the
    // secret would be embedded directly into the SSR HTML. Game over.
    //
    // This was the bug in the first draft of this file: hydration mismatch
    // because the server rendered the real WEBHOOK_SECRET and the client
    // rendered '(undefined)'. The hydration mismatch was the symptom; the
    // leak was the disease.
    //
    // RULE: don't read non-public env from a Client Component at all.
    // For didactic purposes we hard-code '(undefined)' to mirror what the
    // browser sees while keeping the SSR pass identical.
    // -------------------------------------------------------------------

    // SAFE — these ARE meant to be public. NEXT_PUBLIC_ vars get inlined
    // identically on server and client, so the value matches across both
    // render passes.
    const clientSiteName = process.env.NEXT_PUBLIC_SITE_NAME;
    const clientFeatureBeta = process.env.NEXT_PUBLIC_FEATURE_BETA;

    // NEVER touch `process.env.WEBHOOK_SECRET` here. Static placeholders only.
    const clientWebhookSecret = '(undefined)';
    const clientAuthSecret = '(undefined)';

    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            {/* CLIENT column ------------------------------------------------ */}
            <div className='space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase'>
                        Client
                    </span>
                    <h3 className='text-sm font-semibold text-slate-200'>
                        {t.clientHeading}
                    </h3>
                </div>
                <dl className='space-y-2'>
                    <EnvRow
                        keyName='NEXT_PUBLIC_SITE_NAME'
                        value={clientSiteName ?? '(undefined)'}
                        kind='public'
                    />
                    <EnvRow
                        keyName='NEXT_PUBLIC_FEATURE_BETA'
                        value={clientFeatureBeta ?? '(undefined)'}
                        kind='public'
                    />
                    <EnvRow
                        keyName='WEBHOOK_SECRET'
                        value={clientWebhookSecret ?? '(undefined)'}
                        kind='secret'
                    />
                    <EnvRow
                        keyName='AUTH_SECRET'
                        value={clientAuthSecret ?? '(undefined)'}
                        kind='secret'
                    />
                </dl>
                <p className='text-[11px] leading-relaxed text-emerald-300/80'>
                    {t.safeHint}
                </p>
            </div>

            {/* SERVER column ------------------------------------------------ */}
            <div className='space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
                <div className='flex items-center gap-2'>
                    <span className='inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                        Server
                    </span>
                    <h3 className='text-sm font-semibold text-slate-200'>
                        {t.serverHeading}
                    </h3>
                </div>
                <dl className='space-y-2'>
                    <EnvRow
                        keyName='NEXT_PUBLIC_SITE_NAME'
                        value={publicEnv.NEXT_PUBLIC_SITE_NAME}
                        kind='public'
                    />
                    <EnvRow
                        keyName='NEXT_PUBLIC_FEATURE_BETA'
                        value={String(publicEnv.NEXT_PUBLIC_FEATURE_BETA)}
                        kind='public'
                    />
                    <EnvRow
                        keyName='WEBHOOK_SECRET'
                        value={`length=${serverEnv.WEBHOOK_SECRET.length} · fingerprint=${serverEnv.WEBHOOK_SECRET.fingerprint}`}
                        kind='secret'
                    />
                    <EnvRow
                        keyName='AUTH_SECRET'
                        value={`length=${serverEnv.AUTH_SECRET.length}`}
                        kind='secret'
                    />
                    <EnvRow
                        keyName='NODE_ENV'
                        value={serverEnv.NODE_ENV}
                        kind='public'
                    />
                </dl>
                <p className='text-[11px] leading-relaxed text-violet-300/80'>
                    {t.leakWarning}
                </p>
            </div>
        </div>
    );
}

function EnvRow({
    keyName,
    value,
    kind,
}: {
    keyName: string;
    value: string;
    kind: 'public' | 'secret';
}) {
    const isPublic = kind === 'public';
    const isUndefined = value === '(undefined)';
    return (
        <div className='flex flex-col gap-1 rounded bg-slate-950/40 p-2 sm:flex-row sm:items-center sm:gap-3'>
            <code className='font-(--font-mono) text-[11px] tracking-tight text-slate-400'>
                {keyName}
            </code>
            <span
                className={`flex-1 truncate font-(--font-mono) text-[12px] ${
                    isUndefined
                        ? 'text-slate-600 italic'
                        : isPublic
                          ? 'text-emerald-200'
                          : 'text-amber-200'
                }`}
            >
                {value}
            </span>
            <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wide uppercase ${
                    isPublic
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                }`}
            >
                {isPublic ? 'public' : 'secret'}
            </span>
        </div>
    );
}
