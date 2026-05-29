// =============================================================================
// app/lessons/server-actions/form/page.tsx
// SERVER COMPONENT — pure <form action={fn}> demo.
// -----------------------------------------------------------------------------
// 🧠 THE WHOLE PAGE IS A SERVER COMPONENT. No 'use client' anywhere in this
// file. The two forms render server-side; their action props point at
// `'use server'` functions imported from ../_lib/actions. The interactivity
// comes from Next handling the POST round-trip transparently.
//
// The item list is wrapped in <Suspense> so the static shell (header, form,
// prose) can prerender; only the list streams in at request time.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
// =============================================================================

import { Suspense } from 'react';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import {
    addItemAction,
    removeItemAction,
} from '../_lib/actions';
import { getItemsUncached } from '../_lib/store';

export const metadata: Metadata = {
    title: 'Form action · Server Actions · Living Notebook',
};

// -----------------------------------------------------------------------------
// Dynamic leaf — reads the store inside a Suspense boundary.
// -----------------------------------------------------------------------------
async function ItemList() {
    const items = await getItemsUncached();
    return (
        <div className='space-y-2'>
            <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                Items in the store (uncached, fresh)
            </p>
            <ul className='divide-y divide-slate-800/60 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40'>
                {items.length === 0 && (
                    <li className='px-3 py-2 text-xs text-slate-500 italic'>
                        — empty —
                    </li>
                )}
                {items.map(name => (
                    <li
                        key={name}
                        className='flex items-center justify-between gap-3 px-3 py-2'
                    >
                        <span className='font-mono text-sm text-slate-200'>
                            {name}
                        </span>
                        {/* Each row has its OWN form. The hidden input carries
                            the item name into the FormData. */}
                        <form action={removeItemAction}>
                            <input type='hidden' name='name' value={name} />
                            <button
                                type='submit'
                                className='inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-rose-500/50 hover:text-rose-300'
                                aria-label={`Remove ${name}`}
                            >
                                ×
                            </button>
                        </form>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ItemListSkeleton() {
    return (
        <div className='space-y-2'>
            <div className='h-3 w-32 animate-pulse rounded bg-slate-800' />
            <div className='space-y-2 rounded-lg border border-slate-800/60 bg-slate-900/40 p-3'>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className='h-4 w-3/4 animate-pulse rounded bg-slate-800'
                    />
                ))}
            </div>
        </div>
    );
}

export default function FormDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='form' />

            {/* Add-item form — pure server-rendered <form action={fn}>. */}
            <section className='space-y-3'>
                <form
                    action={addItemAction}
                    className='flex flex-wrap items-center gap-2'
                >
                    <input
                        type='text'
                        name='name'
                        placeholder='New item name'
                        required
                        className='min-w-0 flex-1 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none'
                    />
                    <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-400'
                    >
                        Add
                    </button>
                </form>
            </section>

            {/* Item list — dynamic leaf. */}
            <Suspense fallback={<ItemListSkeleton />}>
                <ItemList />
            </Suspense>

            <section className='space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-4'>
                <p className='text-sm font-semibold text-sky-200'>
                    📮 Takeaway
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Add &quot;Linus Torvalds&quot;. The form POSTs to
                    addItemAction, which mutates the store and calls
                    revalidatePath. Next regenerates the page HTML; the
                    browser receives new markup; the list shows the new item.
                    Zero useState. Open the Network tab: one POST, one
                    response.
                </p>
            </section>
        </article>
    );
}
