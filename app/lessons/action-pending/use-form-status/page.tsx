// =============================================================================
// app/lessons/action-pending/use-form-status/page.tsx
// SERVER COMPONENT — the form is server-rendered. The SubmitButton is the
// only Client island; it auto-disables via useFormStatus().
// =============================================================================

import { Suspense } from 'react';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import { getSubscribers } from '../_lib/store';
import {
    removeSubscriberAction,
    slowSubscribeAction,
} from '../_lib/actions';
import SubmitButton from './_components/submit-button';

export const metadata: Metadata = {
    title: 'useFormStatus · Pending UI · Living Notebook',
};

async function SubscribersList() {
    const subscribers = await getSubscribers();
    return (
        <div className='space-y-2'>
            <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                Subscribers
            </p>
            <ul className='divide-y divide-slate-800/60 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40'>
                {subscribers.length === 0 && (
                    <li className='px-3 py-2 text-xs text-slate-500 italic'>
                        — empty —
                    </li>
                )}
                {subscribers.map(name => (
                    <li
                        key={name}
                        className='flex items-center justify-between gap-3 px-3 py-2'
                    >
                        <span className='font-mono text-sm text-slate-200'>
                            {name}
                        </span>
                        <form action={removeSubscriberAction}>
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

function ListSkeleton() {
    return (
        <div className='space-y-2'>
            <div className='h-3 w-24 animate-pulse rounded bg-slate-800' />
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

export default function UseFormStatusDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='formStatus' />

            {/* Server-rendered form. The action prop is a Server Action.
                The SubmitButton inside is the Client island reading
                useFormStatus(). No prop-drilling. */}
            <form
                action={slowSubscribeAction}
                className='flex flex-wrap items-center gap-2'
            >
                <input
                    type='text'
                    name='name'
                    placeholder='New subscriber'
                    required
                    className='min-w-0 flex-1 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none'
                />
                <SubmitButton />
            </form>

            <Suspense fallback={<ListSkeleton />}>
                <SubscribersList />
            </Suspense>
        </article>
    );
}
