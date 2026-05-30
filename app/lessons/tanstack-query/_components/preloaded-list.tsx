'use client';
// =============================================================================
// app/lessons/tanstack-query/_components/preloaded-list.tsx
// LAB 4 — client useQuery that READS PREFETCHED DATA from HydrationBoundary.
// -----------------------------------------------------------------------------
// 🧠 Pattern
// The page.tsx Server Component creates a temporary QueryClient, calls
// `prefetchQuery({ queryKey, queryFn })` against the SAME data layer (skipping
// HTTP), then serialises the cache via `dehydrate()`. The serialised cache
// is dropped into the client tree via <HydrationBoundary state={...}>.
//
// When THIS component mounts on the client, its useQuery looks up the exact
// same queryKey and finds the data already in cache — no loading state, no
// network request. The query is marked "fresh" for staleTime ms. Any
// subsequent refetch (user interaction, focus, invalidation) hits the API
// normally.
//
// 🧠 Why we DON'T use queryKeys.items.list('') here
// We register this preloaded data under a SEPARATE key so the search and
// mutation demos don't accidentally consume the prefetched snapshot. If they
// did, they'd never make a real HTTP request (their loading states would
// never fire), and the lesson's pedagogy would collapse.
// =============================================================================

import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '../_lib/api-client';
import type { Item } from '../../../api/_db/mock-items';

export default function PreloadedList({
    badge,
    description,
    prefetchedLabel,
    refetchingLabel,
    refetchLabel,
}: {
    badge: string;
    description: string;
    prefetchedLabel: string;
    refetchingLabel: string;
    refetchLabel: string;
}) {
    const { data, isFetching, isFetchedAfterMount, refetch } = useQuery<Item[]>({
        queryKey: ['items', 'preloaded'],
        queryFn: () => fetchItems(''),
        // Keep the prefetched data fresh long enough that the user can SEE
        // the no-loading-state behaviour before any background refetch kicks
        // in. In production you'd tune to your real freshness requirements.
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className='space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4'>
            <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-amber-300 uppercase'>
                    {badge}
                </span>
                <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                        isFetching
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                            : isFetchedAfterMount
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    }`}
                >
                    {isFetching
                        ? refetchingLabel
                        : isFetchedAfterMount
                          ? 'fresh'
                          : prefetchedLabel}
                </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {description}
            </p>
            <ul className='space-y-1'>
                {data?.map(item => (
                    <li
                        key={item.id}
                        className='flex items-center gap-2 rounded-md border border-slate-700/40 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200'
                    >
                        <span className='flex-1'>{item.title}</span>
                        <span className='shrink-0 rounded-full border border-slate-700/60 bg-slate-800 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-400'>
                            {item.tag}
                        </span>
                    </li>
                ))}
            </ul>
            <button
                type='button'
                onClick={() => refetch()}
                disabled={isFetching}
                className='w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20 disabled:opacity-50'
            >
                {refetchLabel}
            </button>
        </div>
    );
}
