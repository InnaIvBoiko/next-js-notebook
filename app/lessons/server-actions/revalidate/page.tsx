// =============================================================================
// app/lessons/server-actions/revalidate/page.tsx
// SERVER COMPONENT — the live demo Lesson 2 promised: updateTag('items')
// invalidating the cacheTag('items')-tagged cached function.
// -----------------------------------------------------------------------------
// 🧠 STRUCTURE
// Two columns. Both read from the same underlying store:
//   • Left  (CachedList)   → getItemsCached()   with `'use cache'` +
//                            cacheTag('items') + cacheLife('hours').
//   • Right (UncachedList) → getItemsUncached() — always fresh.
//
// The add form mutates the store and calls revalidatePath (NOT updateTag).
// The right side picks up the change immediately. The left side stays stale
// (its cache entry, keyed on the function signature, is still valid).
//
// The "Invalidate items tag" button calls updateTag('items'), which
// immediately expires every entry tagged 'items'. On the next render, the
// left side re-executes getItemsCached() and catches up.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md
// =============================================================================

import { Suspense } from 'react';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { getItemsCached, getItemsUncached } from '../_lib/store';
import {
    addItemNoInvalidateAction,
    invalidateItemsTagAction,
} from '../_lib/actions';

export const metadata: Metadata = {
    title: 'updateTag · Server Actions · Living Notebook',
};

// -----------------------------------------------------------------------------
// Lists — each is an async Server Component wrapped in its own <Suspense>.
// -----------------------------------------------------------------------------

async function CachedList() {
    const items = await getItemsCached();
    return (
        <ListCard
            accent='emerald'
            label="CACHED — getItemsCached() with cacheTag('items')"
            hint="`'use cache'` + cacheTag('items'). Stays stale until updateTag fires."
            items={items}
        />
    );
}

async function UncachedList() {
    const items = await getItemsUncached();
    return (
        <ListCard
            accent='slate'
            label='UNCACHED — getItemsUncached()'
            hint='No cache. Reads the store every request.'
            items={items}
        />
    );
}

function ListSkeleton({ accent }: { accent: 'emerald' | 'slate' }) {
    const border =
        accent === 'emerald'
            ? 'border-emerald-500/20'
            : 'border-slate-700/60';
    const bg = accent === 'emerald' ? 'bg-emerald-500/5' : 'bg-slate-900/40';
    return (
        <div className={`space-y-3 rounded-lg border p-4 ${border} ${bg}`}>
            <div className='h-3 w-40 animate-pulse rounded bg-slate-800' />
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className='h-4 w-3/4 animate-pulse rounded bg-slate-800'
                />
            ))}
        </div>
    );
}

function ListCard({
    label,
    hint,
    items,
    accent,
}: {
    label: string;
    hint: string;
    items: string[];
    accent: 'emerald' | 'slate';
}) {
    const border =
        accent === 'emerald'
            ? 'border-emerald-500/20'
            : 'border-slate-700/60';
    const bg = accent === 'emerald' ? 'bg-emerald-500/5' : 'bg-slate-900/40';
    const titleColor =
        accent === 'emerald' ? 'text-emerald-200' : 'text-slate-300';
    return (
        <div className={`space-y-3 rounded-lg border p-4 ${border} ${bg}`}>
            <div>
                <p
                    className={`text-xs font-semibold tracking-wide uppercase ${titleColor}`}
                >
                    {label}
                </p>
                <p className='mt-1 text-[10px] text-slate-500'>{hint}</p>
            </div>
            <ul className='space-y-1 font-mono text-sm text-slate-100'>
                {items.length === 0 && (
                    <li className='text-xs text-slate-500 italic'>— empty —</li>
                )}
                {items.map(item => (
                    <li key={item}>· {item}</li>
                ))}
                <li className='pt-1 text-[10px] text-slate-500'>
                    count: {items.length}
                </li>
            </ul>
        </div>
    );
}

export default function RevalidateDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='revalidate' />

            {/* Controls — add (no invalidation) + invalidate button. */}
            <section className='space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'>
                <form
                    action={addItemNoInvalidateAction}
                    className='flex flex-wrap items-center gap-2'
                >
                    <input
                        type='text'
                        name='name'
                        placeholder='New item name'
                        required
                        className='min-w-0 flex-1 rounded-md border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none'
                    />
                    <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600'
                    >
                        Add (no cache invalidation)
                    </button>
                </form>
                <form action={invalidateItemsTagAction}>
                    <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-400'
                    >
                        ♻️ Invalidate &apos;items&apos; tag (updateTag)
                    </button>
                </form>
            </section>

            {/* The two lists. */}
            <section className='grid gap-4 sm:grid-cols-2'>
                <Suspense fallback={<ListSkeleton accent='emerald' />}>
                    <CachedList />
                </Suspense>
                <Suspense fallback={<ListSkeleton accent='slate' />}>
                    <UncachedList />
                </Suspense>
            </section>

            <section className='space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                <p className='text-sm font-semibold text-emerald-200'>
                    ♻️ Takeaway
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Sequence: (1) Add &quot;Linus Torvalds&quot; using the
                    first button — the RIGHT card shows 4 items, the LEFT
                    still 3 (its cache entry is still valid). (2) Click
                    &quot;Invalidate items tag&quot; — the LEFT now shows 4
                    items (cache entry regenerated, getItemsCached
                    re-executed).
                </p>
                <p className='border-t border-emerald-500/20 pt-3 text-[11px] leading-relaxed text-slate-500'>
                    👀 Watch the server terminal: the log
                    <span className='mx-1 font-mono'>
                        [store] getItemsCached() executed — cache MISS
                    </span>
                    appears only after you press updateTag, never just from
                    adding items.
                </p>
            </section>
        </article>
    );
}
