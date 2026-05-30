'use client';
// =============================================================================
// app/lessons/tanstack-query/_components/search-demo.tsx
// LAB 1 — useQuery with a debounced, composite queryKey.
// -----------------------------------------------------------------------------
// 🧠 Pattern
// The query key includes the search term: ['items', 'list', q]. Every
// distinct value of q is a distinct cache entry. Type "rea", "reac", "react"
// → three separate queries, each cached separately. If the user backspaces
// to "rea" again the result is served INSTANTLY from cache (no network).
//
// 🧠 Debounce
// We don't debounce the fetch — we debounce the queryKey. The input updates
// `raw` immediately for UI responsiveness, then a 300 ms `useEffect` copies
// it into `debounced` which is what feeds the queryKey. This way TanStack
// Query never sees the in-between values and we don't fire 5 requests for
// "react".
// =============================================================================

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchItems } from '../_lib/api-client';
import { queryKeys } from '../_lib/query-keys';

export default function SearchDemo({
    placeholder,
    statusFetching,
    statusFresh,
    statusEmpty,
    badge,
    description,
}: {
    placeholder: string;
    statusFetching: string;
    statusFresh: string;
    statusEmpty: string;
    badge: string;
    description: string;
}) {
    const [raw, setRaw] = useState('');
    const [debounced, setDebounced] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebounced(raw), 300);
        return () => clearTimeout(t);
    }, [raw]);

    const { data, isFetching, isPlaceholderData } = useQuery({
        queryKey: queryKeys.items.list(debounced),
        queryFn: () => fetchItems(debounced),
        // Keep previous results visible while fetching the next ones —
        // avoids the "list collapses to a loading spinner on every keystroke"
        // UX (common React Query gotcha for search-as-you-type).
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    });

    const items = data ?? [];
    const status = isFetching
        ? statusFetching
        : items.length === 0 && debounced.length > 0
          ? statusEmpty
          : statusFresh;

    return (
        <div className='space-y-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4'>
            <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-sky-300 uppercase'>
                    {badge}
                </span>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                        isFetching
                            ? 'border border-amber-500/40 bg-amber-500/15 text-amber-200'
                            : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    } ${isPlaceholderData ? 'opacity-60' : ''}`}
                >
                    {status}
                </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {description}
            </p>
            <input
                type='search'
                value={raw}
                onChange={e => setRaw(e.target.value)}
                placeholder={placeholder}
                className='w-full rounded-md border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none'
            />
            <ul className='space-y-1'>
                {items.map(item => (
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
        </div>
    );
}
