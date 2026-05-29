// =============================================================================
// app/lessons/loading-and-errors/streaming/page.tsx
// SERVER COMPONENT demonstrating GRANULAR streaming with manual <Suspense>.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// No `loading.tsx` next to this page: we are NOT using segment-level Suspense.
// Instead, the page itself renders three sections:
//
//   1. <InstantSection/>  — synchronous; appears immediately with the chrome.
//   2. <Suspense fallback={...}><FastSection/></Suspense>  — async, ~1s wait.
//   3. <Suspense fallback={...}><SlowSection/></Suspense>  — async, ~3s wait.
//
// Each boundary streams independently. The browser receives the HTML in three
// installments. Open DevTools → Network → click the document request → watch
// the response keep extending; or just observe the fallbacks swap one at a
// time.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md
// =============================================================================

import { Suspense } from 'react';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { delay } from '../_lib/delay';
import { content } from '../_lib/content';

export const metadata: Metadata = {
    title: 'Streaming · Loading & Errors · Living Notebook',
};

// -----------------------------------------------------------------------------
// Async Server sub-components — each one suspends the boundary that wraps it.
// They are defined inline because they are demo-only.
// -----------------------------------------------------------------------------

async function FastSection() {
    // connection() per leaf (cacheComponents: true) — Next needs the signal
    // before any non-deterministic read like new Date().
    await connection();
    await delay(1000);
    // We use English for inline section copy; the multilingual prose comes
    // from <DemoHeader/> above. We could pass lang via search params, but it
    // would require turning these into Client components, which would defeat
    // the streaming demo (Server suspends are what drive the streaming).
    return (
        <div className='rounded-lg border border-violet-500/20 bg-violet-500/5 p-4'>
            <p className='text-xs font-semibold tracking-wide text-violet-300 uppercase'>
                FAST CHUNK · arrived at {new Date().toISOString()}
            </p>
            <p className='mt-2 text-sm text-slate-300'>
                Streamed after ~1 second. The HTML for this block was held
                back by the server until <code>delay(1000)</code> resolved.
            </p>
        </div>
    );
}

async function SlowSection() {
    await connection();
    await delay(3000);
    return (
        <div className='rounded-lg border border-rose-500/20 bg-rose-500/5 p-4'>
            <p className='text-xs font-semibold tracking-wide text-rose-300 uppercase'>
                SLOW CHUNK · arrived at {new Date().toISOString()}
            </p>
            <p className='mt-2 text-sm text-slate-300'>
                Streamed after ~3 seconds. Notice how the chrome and the fast
                chunk above showed up long before this one — that is selective
                streaming at work.
            </p>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function StreamingDemoPage() {
    // We need the lang-neutral copy for the fallbacks/section titles. Picking
    // English on the server is the simplest choice; the persistent <LangBar>
    // in the layout still shows the user's chosen language.
    const t = content.en.demos.streaming;

    return (
        <article className='space-y-8'>
            <DemoHeader which='streaming' />

            {/* §1 — Instant: no await, renders synchronously with the page. */}
            <section className='space-y-2'>
                <h2 className='text-sm font-semibold tracking-wide text-emerald-300 uppercase'>
                    {t.instantHeading}
                </h2>
                <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                    <p className='text-sm text-slate-300'>{t.instantBody}</p>
                </div>
            </section>

            {/* §2 — Fast: own <Suspense>, ~1s. */}
            <section className='space-y-2'>
                <h2 className='text-sm font-semibold tracking-wide text-violet-300 uppercase'>
                    {t.fastHeading}
                </h2>
                <Suspense fallback={<SectionSkeleton label={t.fastFallback} />}>
                    <FastSection />
                </Suspense>
            </section>

            {/* §3 — Slow: own <Suspense>, ~3s. */}
            <section className='space-y-2'>
                <h2 className='text-sm font-semibold tracking-wide text-rose-300 uppercase'>
                    {t.slowHeading}
                </h2>
                <Suspense fallback={<SectionSkeleton label={t.slowFallback} />}>
                    <SlowSection />
                </Suspense>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
// Reusable inline skeleton — Server Component, no client overhead.
// -----------------------------------------------------------------------------
function SectionSkeleton({ label }: { label: string }) {
    return (
        <div className='space-y-2 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'>
            <p className='text-xs text-slate-400'>{label}</p>
            <div className='h-3 w-2/3 animate-pulse rounded bg-slate-800' />
            <div className='h-3 w-1/2 animate-pulse rounded bg-slate-800' />
        </div>
    );
}
