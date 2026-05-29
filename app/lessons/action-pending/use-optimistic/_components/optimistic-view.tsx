'use client';
// =============================================================================
// OptimisticView — useOptimistic in action.
// -----------------------------------------------------------------------------
// 🧠 useOptimistic(state, updater) returns [optimisticState, addOptimistic].
//   • Render optimisticState (NOT the prop `subscribers`) — it includes any
//     pending additions on top of the latest committed state.
//   • Call addOptimistic(value) inside the form action — it queues a
//     synchronous update visible immediately.
//   • Once the await-ed Server Action returns and revalidation/refresh
//     replaces the `subscribers` prop, useOptimistic forgets the optimistic
//     entry: the committed state takes over.
//   • If the action throws, useOptimistic reverts to the previous state
//     automatically.
// =============================================================================

import { useOptimistic } from 'react';
import { content } from '../../_lib/content';
import { useLessonLang } from '../../_components/lang-provider';
import {
    optimisticSubscribeAction,
    removeSubscriberAction,
} from '../../_lib/actions';

type OptimisticEntry = { name: string; pending: boolean };

export default function OptimisticView({
    subscribers,
}: {
    subscribers: string[];
}) {
    const { lang } = useLessonLang();
    const t = content[lang].demos.optimistic;

    // The committed state arrives as a prop. We rebuild it as objects with
    // pending:false so the updater can append entries with pending:true.
    const committed: OptimisticEntry[] = subscribers.map(name => ({
        name,
        pending: false,
    }));

    const [optimistic, addOptimistic] = useOptimistic<
        OptimisticEntry[],
        string
    >(committed, (current, newName) => [
        ...current,
        { name: newName, pending: true },
    ]);

    // form action wrapper: kick off the optimistic update SYNCHRONOUSLY
    // (before await), then await the server. After the await, the page
    // re-renders with the fresh `subscribers` prop and useOptimistic
    // switches back to the committed view.
    async function formAction(formData: FormData) {
        const name = String(formData.get('name') ?? '');
        if (!name.trim()) return;
        addOptimistic(name.trim());
        await optimisticSubscribeAction(formData);
    }

    return (
        <div className='space-y-6'>
            <form
                action={formAction}
                className='flex flex-wrap items-center gap-2'
            >
                <input
                    type='text'
                    name='name'
                    placeholder={t.namePlaceholder}
                    required
                    className='min-w-0 flex-1 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none'
                />
                <button
                    type='submit'
                    className='inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-400'
                >
                    {t.submitLabel}
                </button>
            </form>

            <div className='space-y-2'>
                <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                    {t.subscribersHeading}
                </p>
                <ul className='divide-y divide-slate-800/60 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40'>
                    {optimistic.length === 0 && (
                        <li className='px-3 py-2 text-xs text-slate-500 italic'>
                            — empty —
                        </li>
                    )}
                    {optimistic.map(entry => (
                        <li
                            key={`${entry.name}-${entry.pending ? 'p' : 'c'}`}
                            className='flex items-center justify-between gap-3 px-3 py-2'
                        >
                            <span
                                className={
                                    entry.pending
                                        ? 'font-mono text-sm text-slate-400 italic'
                                        : 'font-mono text-sm text-slate-200'
                                }
                            >
                                {entry.name}
                                {entry.pending && (
                                    <span className='ml-2 text-[10px] text-emerald-300 not-italic'>
                                        ({t.pendingTag})
                                    </span>
                                )}
                            </span>
                            {!entry.pending && (
                                <form action={removeSubscriberAction}>
                                    <input
                                        type='hidden'
                                        name='name'
                                        value={entry.name}
                                    />
                                    <button
                                        type='submit'
                                        className='inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-rose-500/50 hover:text-rose-300'
                                        aria-label={`Remove ${entry.name}`}
                                    >
                                        ×
                                    </button>
                                </form>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
