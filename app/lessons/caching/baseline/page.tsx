// =============================================================================
// app/lessons/caching/baseline/page.tsx
// SERVER COMPONENT — uncached baseline reference.
// -----------------------------------------------------------------------------
// 🧠 CACHE COMPONENTS PATTERN
// With cacheComponents: true, Next splits each page into two parts:
//
//   • The STATIC SHELL — everything outside a <Suspense>. Prerendered at
//     build time. Cannot read non-deterministic values (new Date(),
//     Math.random()) or per-request data (cookies, headers, uncached fetch).
//
//   • The DYNAMIC LEAVES — async Server Components wrapped in <Suspense>.
//     Rendered at request time. Free to read everything.
//
// This page's shell is the <DemoHeader> + the explanatory boxes. The
// dynamic leaf is <UncachedNow/>, which reads new Date() after signaling
// dynamism with connection(). The shell prerenders; the leaf streams.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
// =============================================================================

import { Suspense } from 'react';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';

export const metadata: Metadata = {
    title: 'Baseline · Caching · Living Notebook',
};

async function getNow(): Promise<string> {
    console.log('[baseline] getNow() executed at', new Date().toISOString());
    return new Date().toISOString();
}

// -----------------------------------------------------------------------------
// Dynamic leaf — runs at request time. Must be inside a <Suspense> boundary
// in the page tree. Signals dynamism with connection() before touching the
// current time.
// -----------------------------------------------------------------------------
async function UncachedNow() {
    await connection();
    const now = await getNow();
    const renderedAt = new Date().toISOString();
    return (
        <section className='space-y-4'>
            <div className='rounded-lg border border-slate-700/60 bg-slate-900/40 p-5'>
                <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                    getNow()
                </p>
                <p className='mt-2 font-mono text-lg text-slate-100'>{now}</p>
            </div>
            <div className='rounded-lg border border-slate-800/60 bg-slate-950/40 p-3'>
                <p className='font-mono text-[11px] text-slate-500'>
                    page rendered at: {renderedAt}
                </p>
            </div>
        </section>
    );
}

function NowSkeleton() {
    return (
        <section className='space-y-4'>
            <div className='space-y-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-5'>
                <div className='h-3 w-24 animate-pulse rounded bg-slate-800' />
                <div className='h-5 w-48 animate-pulse rounded bg-slate-800' />
            </div>
        </section>
    );
}

export default function BaselineDemoPage() {
    return (
        <article className='space-y-8'>
            {/* Static shell — prerendered at build time. */}
            <DemoHeader which='baseline' />

            {/* Dynamic leaf — streams in at request time. */}
            <Suspense fallback={<NowSkeleton />}>
                <UncachedNow />
            </Suspense>

            {/* Static shell — explanatory copy, no dynamic data. */}
            <section className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4'>
                <p className='text-sm font-semibold text-amber-200'>
                    🔄 Press Cmd+R five times
                </p>
                <p className='mt-2 text-xs leading-relaxed text-slate-300'>
                    The timestamp above changes every single reload. No
                    caching is active — this is the Next 16 default. The
                    /cached demo will keep one of its two timestamps STABLE
                    under the same reload pressure.
                </p>
            </section>
        </article>
    );
}
