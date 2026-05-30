'use client';
// =============================================================================
// app/lessons/tanstack-query/_components/mutation-demo.tsx
// LAB 3 — useMutation with optimistic update + rollback + invalidateQueries.
// -----------------------------------------------------------------------------
// 🧠 The optimistic-update lifecycle
//   1) onMutate: cancel any in-flight refetch, snapshot the current cache,
//      patch the cache with the OPTIMISTIC value, return the snapshot.
//   2) The actual fetch runs. If it succeeds → onSuccess fires.
//   3) If it FAILS → onError fires with the snapshot from step 1. We restore
//      the cache → the toggle visually "snaps back". (The mock API fails
//      randomly 25% of the time — keep clicking to see the rollback.)
//   4) onSettled (always): invalidate queries so the next read fetches fresh
//      data from the server, replacing both our optimistic guess and any
//      rolled-back state.
//
// 🧠 Why this matters
// Without optimistic updates, the UI freezes for ~500 ms on every click while
// waiting for the server. With them, the toggle feels instant — and if the
// server actually disagrees, we visually correct after the rollback.
// =============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchItems, toggleFavoriteRequest } from '../_lib/api-client';
import { queryKeys } from '../_lib/query-keys';
import type { Item } from '../../../api/_db/mock-items';

export default function MutationDemo({
    badge,
    description,
    errorLabel,
    favoritedLabel,
}: {
    badge: string;
    description: string;
    errorLabel: string;
    favoritedLabel: string;
}) {
    const queryClient = useQueryClient();

    // The mutation demo and the search demo both read /api/items. We share
    // the same query key family so invalidating one invalidates the other.
    const { data: items = [] } = useQuery({
        queryKey: queryKeys.items.list(''),
        queryFn: () => fetchItems(''),
    });

    const toggle = useMutation({
        mutationFn: (id: string) => toggleFavoriteRequest(id),

        // 1️⃣ Optimistic patch
        onMutate: async (id: string) => {
            // Cancel any in-flight refetch so it can't overwrite our patch.
            await queryClient.cancelQueries({ queryKey: queryKeys.items.all });
            // Snapshot the current cache so we can roll back if the mutation
            // fails. We snapshot ALL list variants because the user might
            // have a different search active.
            const snapshot = queryClient.getQueriesData<Item[]>({
                queryKey: queryKeys.items.all,
            });
            // Apply optimistic update to every list query.
            queryClient.setQueriesData<Item[]>(
                { queryKey: queryKeys.items.all },
                old =>
                    old?.map(it =>
                        it.id === id ? { ...it, favorite: !it.favorite } : it,
                    ),
            );
            return { snapshot };
        },

        // 2️⃣ Roll back on failure
        onError: (_err, _id, context) => {
            if (!context?.snapshot) return;
            for (const [key, data] of context.snapshot) {
                queryClient.setQueryData(key, data);
            }
        },

        // 3️⃣ Always sync with the server at the end
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
        },
    });

    return (
        <div className='space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
            <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {badge}
                </span>
                {toggle.isError && (
                    <span className='shrink-0 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] text-rose-200'>
                        {errorLabel}
                    </span>
                )}
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {description}
            </p>
            <ul className='space-y-1'>
                {items.map(item => (
                    <li
                        key={item.id}
                        className='flex items-center gap-2 rounded-md border border-slate-700/40 bg-slate-900/40 px-3 py-1.5'
                    >
                        <button
                            type='button'
                            onClick={() => toggle.mutate(item.id)}
                            className={`text-lg leading-none ${
                                item.favorite
                                    ? 'text-amber-300'
                                    : 'text-slate-600 hover:text-slate-400'
                            }`}
                            aria-label={favoritedLabel}
                        >
                            {item.favorite ? '★' : '☆'}
                        </button>
                        <span className='flex-1 text-sm text-slate-200'>
                            {item.title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
