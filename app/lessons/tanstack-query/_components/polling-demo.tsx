'use client';
// =============================================================================
// app/lessons/tanstack-query/_components/polling-demo.tsx
// LAB 2 — useQuery with refetchInterval. Server time updates every 3 seconds.
// -----------------------------------------------------------------------------
// 🧠 refetchInterval — the unsung superpower
// Setting refetchInterval to a number turns useQuery into a poller. The hook
// schedules `queryFn` every N ms. Combined with `refetchIntervalInBackground:
// false` (the default), polling PAUSES when the tab is hidden — TanStack
// Query reads the Page Visibility API for you.
//
// 🧠 refetchOnWindowFocus
// Defaults to true. Switch tabs away and back → instant refetch. Try it
// below: change tab, wait 10s, switch back → the server time jumps.
//
// 🧠 Locale-aware date formatting + SSR
// `toLocaleTimeString()` formats according to the current runtime's locale.
// On the server (Node, en-US default) it returns "1:00:00 AM"; in a IT
// browser it returns "01:00:00". React would catch the divergence as a
// hydration mismatch and regenerate the tree. We gate the display behind a
// `mounted` flag (set in a useEffect) so server + first client render emit
// the same placeholder ('—'), hydration succeeds, THEN we swap in the
// locale-aware string. Same trick as render-counter in Lesson 1.
// =============================================================================

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchServerTime } from '../_lib/api-client';
import { queryKeys } from '../_lib/query-keys';

export default function PollingDemo({
    badge,
    description,
    pollingLabel,
    pausedLabel,
}: {
    badge: string;
    description: string;
    pollingLabel: string;
    pausedLabel: string;
}) {
    const { data, isFetching, dataUpdatedAt } = useQuery({
        queryKey: queryKeys.serverTime(),
        queryFn: fetchServerTime,
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
    });

    // Defer locale-dependent formatting until after hydration. Server and
    // first client render emit '—' → identical HTML → no mismatch.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- post-hydration unveil
        setMounted(true);
    }, []);

    return (
        <div className='space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
            <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-violet-300 uppercase'>
                    {badge}
                </span>
                <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                        isFetching
                            ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    }`}
                >
                    {isFetching ? pollingLabel : pausedLabel}
                </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {description}
            </p>
            <div className='rounded-md border border-violet-500/20 bg-slate-950/60 p-4 text-center'>
                <p className='font-mono text-2xl text-violet-200'>
                    {data?.now ?? '—'}
                </p>
                <p className='mt-1 font-mono text-[10px] text-slate-500'>
                    last refresh:{' '}
                    {mounted && dataUpdatedAt > 0
                        ? new Date(dataUpdatedAt).toLocaleTimeString()
                        : '—'}
                </p>
            </div>
        </div>
    );
}
