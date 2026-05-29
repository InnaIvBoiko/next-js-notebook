// =============================================================================
// app/lessons/caching/react-cache/page.tsx
// SERVER COMPONENT — React.cache() per-request memoization.
// -----------------------------------------------------------------------------
// 🧠 CACHE COMPONENTS PATTERN
// Static shell (DemoHeader + explanatory box) prerenders. The three cells
// stream from a SINGLE Suspense boundary so they're rendered together as
// one chunk — that way you can compare the timestamps and verify they're
// identical (proof of cache() de-duplication).
//
// 🧠 WHY use cache() AND NOT `'use cache'`?
// `'use cache'`  → caches a value ACROSS requests. Bound by cacheLife.
// React.cache()  → caches a value WITHIN one request. Cleared on each new
//                  request. Zero configuration. Ideal for de-duping the same
//                  DB query called from many components in one render.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
//          (search for "Sharing data with context and React.cache")
// =============================================================================

import { Suspense, cache } from 'react';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';

export const metadata: Metadata = {
    title: 'React.cache() · Caching · Living Notebook',
};

const getNowOnce = cache(async (): Promise<string> => {
    // Fires ONCE per request even though three callers below await it.
    console.log(
        '[react-cache] getNowOnce() executed at',
        new Date().toISOString()
    );
    return new Date().toISOString();
});

// -----------------------------------------------------------------------------
// Cells — each calls getNowOnce(). cache() ensures all three see the same
// resolved value within one render.
// -----------------------------------------------------------------------------
async function CellA() {
    const t = await getNowOnce();
    return <Cell label='Component A' value={t} accent='violet' />;
}

async function CellB() {
    const t = await getNowOnce();
    return <Cell label='Component B' value={t} accent='sky' />;
}

async function CellC() {
    const t = await getNowOnce();
    return <Cell label='Component C' value={t} accent='emerald' />;
}

// -----------------------------------------------------------------------------
// Dynamic leaf wrapping all three cells. connection() goes here, not on each
// cell, because we want the whole group to be one dynamic boundary.
// -----------------------------------------------------------------------------
async function CellGroup() {
    await connection();
    return (
        <section className='grid gap-4 sm:grid-cols-3'>
            <CellA />
            <CellB />
            <CellC />
        </section>
    );
}

function CellGroupSkeleton() {
    return (
        <section className='grid gap-4 sm:grid-cols-3'>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className='space-y-2 rounded-lg border border-slate-700/60 bg-slate-900/40 p-4'
                >
                    <div className='h-2 w-20 animate-pulse rounded bg-slate-800' />
                    <div className='h-3 w-32 animate-pulse rounded bg-slate-800' />
                </div>
            ))}
        </section>
    );
}

export default function ReactCacheDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='reactCache' />

            <Suspense fallback={<CellGroupSkeleton />}>
                <CellGroup />
            </Suspense>

            <section className='space-y-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4'>
                <p className='text-sm font-semibold text-violet-200'>
                    ♻️ Three components, one execution
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    All three cells above show the EXACT same timestamp,
                    millisecond-precise. cache() de-duplicated the three awaits
                    into a single call. Reload (Cmd+R) and watch them move
                    together — but the three values always stay equal within one
                    render.
                </p>
                <p className='border-t border-violet-500/20 pt-3 text-[11px] leading-relaxed text-slate-500'>
                    👀 Watch the server terminal: ONE [react-cache] log line per
                    page render, not three. That&apos;s the proof in the
                    process.
                </p>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
function Cell({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: 'violet' | 'sky' | 'emerald';
}) {
    const border = {
        violet: 'border-violet-500/30 bg-violet-500/5',
        sky: 'border-sky-500/30 bg-sky-500/5',
        emerald: 'border-emerald-500/30 bg-emerald-500/5',
    }[accent];
    const titleColor = {
        violet: 'text-violet-200',
        sky: 'text-sky-200',
        emerald: 'text-emerald-200',
    }[accent];
    return (
        <div className={`space-y-2 rounded-lg border p-4 ${border}`}>
            <p
                className={`text-[10px] font-semibold tracking-wide uppercase ${titleColor}`}
            >
                {label}
            </p>
            <p className='font-mono text-xs break-all text-slate-100'>
                {value}
            </p>
        </div>
    );
}
