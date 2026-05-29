// =============================================================================
// app/lessons/caching/cached/page.tsx
// SERVER COMPONENT — `'use cache'` + cacheLife('seconds') in action.
// -----------------------------------------------------------------------------
// 🧠 CACHE COMPONENTS PATTERN
// The page's static shell (header + explanatory boxes) prerenders. The two
// dynamic leaves stream at request time:
//
//   • <UncachedCell/>  — uses connection() + new Date(). Re-renders every
//                        request. Equivalent to Lesson 1 default behavior.
//   • <CachedCell/>    — its getCachedNow() function is `'use cache'` with
//                        cacheLife('seconds') (revalidate=1s). So even
//                        within a dynamic leaf, the value is reused for ~1s
//                        before being recomputed.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md
// =============================================================================

import { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';

export const metadata: Metadata = {
    title: 'Cached · Caching · Living Notebook',
};

async function getUncachedNow(): Promise<string> {
    console.log(
        '[cached] getUncachedNow() executed at',
        new Date().toISOString(),
    );
    return new Date().toISOString();
}

async function getCachedNow(): Promise<string> {
    'use cache';
    // 'seconds' profile: revalidate=1s, stale=30s, expire=1min.
    cacheLife('seconds');
    console.log(
        '[cached] getCachedNow() executed at',
        new Date().toISOString(),
    );
    return new Date().toISOString();
}

// -----------------------------------------------------------------------------
// Dynamic leaves
// -----------------------------------------------------------------------------
async function UncachedCell() {
    await connection();
    const value = await getUncachedNow();
    return (
        <TimestampCard
            label='UNCACHED — getUncachedNow()'
            value={value}
            accent='slate'
            hint='No directive. Runs on every request. Next 16 default.'
        />
    );
}

async function CachedCell() {
    const value = await getCachedNow();
    return (
        <TimestampCard
            label="CACHED — getCachedNow() with 'use cache'"
            value={value}
            accent='emerald'
            hint="'use cache' + cacheLife('seconds'). Revalidates every ~1s."
        />
    );
}

function CellSkeleton({ accent }: { accent: 'slate' | 'emerald' }) {
    const border =
        accent === 'emerald'
            ? 'border-emerald-500/20'
            : 'border-slate-700/60';
    const bg = accent === 'emerald' ? 'bg-emerald-500/5' : 'bg-slate-900/40';
    return (
        <div className={`space-y-3 rounded-lg border p-4 ${border} ${bg}`}>
            <div className='h-3 w-32 animate-pulse rounded bg-slate-800' />
            <div className='h-5 w-48 animate-pulse rounded bg-slate-800' />
            <div className='h-2 w-40 animate-pulse rounded bg-slate-800' />
        </div>
    );
}

export default function CachedDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='cached' />

            <section className='grid gap-4 sm:grid-cols-2'>
                <Suspense fallback={<CellSkeleton accent='slate' />}>
                    <UncachedCell />
                </Suspense>
                <Suspense fallback={<CellSkeleton accent='emerald' />}>
                    <CachedCell />
                </Suspense>
            </section>

            <section className='space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                <p className='text-sm font-semibold text-emerald-200'>
                    🧊 Cmd+R rapidly and watch the right column
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Reload 5-10 times in quick succession. The LEFT timestamp
                    changes every single time. The RIGHT one stays frozen for
                    ~1 second (cacheLife profile `seconds` = 1s revalidate),
                    then jumps to a new value. That&apos;s the cache in action.
                </p>
                <p className='text-xs leading-relaxed text-slate-400'>
                    In production you&apos;d use{' '}
                    <code className='font-mono text-emerald-300'>
                        {"cacheLife('hours')"}
                    </code>{' '}
                    or{' '}
                    <code className='font-mono text-emerald-300'>
                        {"cacheLife('days')"}
                    </code>{' '}
                    depending on your data&apos;s update frequency.
                </p>
                <p className='border-t border-emerald-500/20 pt-3 text-[11px] leading-relaxed text-slate-500'>
                    👀 Watch the server terminal: [cached] getUncachedNow()
                    logs every reload; [cached] getCachedNow() logs only when
                    revalidation actually runs (≈ once per 1-second window).
                </p>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
function TimestampCard({
    label,
    value,
    hint,
    accent,
}: {
    label: string;
    value: string;
    hint: string;
    accent: 'slate' | 'emerald';
}) {
    const border =
        accent === 'emerald'
            ? 'border-emerald-500/20'
            : 'border-slate-700/60';
    const bg = accent === 'emerald' ? 'bg-emerald-500/5' : 'bg-slate-900/40';
    const titleColor =
        accent === 'emerald' ? 'text-emerald-200' : 'text-slate-300';
    return (
        <div className={`space-y-2 rounded-lg border p-4 ${border} ${bg}`}>
            <p
                className={`text-xs font-semibold tracking-wide uppercase ${titleColor}`}
            >
                {label}
            </p>
            <p className='font-mono text-base text-slate-100'>{value}</p>
            <p className='text-[11px] text-slate-500'>{hint}</p>
        </div>
    );
}
