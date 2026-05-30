'use client';
// =============================================================================
// app/lessons/api-routes/_components/cache-compare.tsx
// LAB 3 — side-by-side dynamic vs `'use cache'` GET handler.
// -----------------------------------------------------------------------------
// 🧠 What this teaches
// Two GET endpoints differ ONLY by how they expose `Date.now()`:
//   /api/now-dynamic — calls Date.now() directly inside GET → request-time
//   /api/now-static  — delegates to a `'use cache'` helper → frozen by
//                      cacheLife('max') AND tagged 'now-static'
//
// Press "Refetch" on each box repeatedly: the dynamic box updates `nonce` on
// every click, the cached one keeps the same nonce until you press the
// "Invalidate cache" button (which fires a Server Action calling
// `updateTag('now-static')`).
//
// ⚠️ DEV-mode caveat: in `next dev`, HMR (Hot Module Replacement) ALSO
// invalidates `'use cache'` entries. If you edit ANY file in the project
// while the lab is open, the cached nonce silently regenerates. In a
// production build (`next start`) the cache only changes via cacheLife
// expiry or explicit `updateTag`.
//
// We use `cache: 'no-store'` on the fetch so the BROWSER's own HTTP cache
// can't interfere — what we're demonstrating is the SERVER cache.
// =============================================================================

import { useState, useTransition } from 'react';
import { invalidateNowStaticAction } from '../_lib/actions';

type Payload = {
    kind: 'dynamic' | 'static';
    now: string;
    unixMs: number;
    nonce: string;
};

type CacheLabels = {
    badge: string;
    description: string;
    dynamicLabel: string;
    staticLabel: string;
    refetchLabel: string;
    fetchingLabel: string;
    nonceLabel: string;
    invalidateLabel: string;
    invalidatingLabel: string;
    devNote: string;
};

function CacheBox({
    label,
    accent,
    url,
    refetchLabel,
    fetchingLabel,
    nonceLabel,
    onInvalidate,
    invalidateLabel,
    invalidatingLabel,
}: {
    label: string;
    accent: 'sky' | 'violet';
    url: string;
    refetchLabel: string;
    fetchingLabel: string;
    nonceLabel: string;
    onInvalidate?: () => Promise<void>;
    invalidateLabel?: string;
    invalidatingLabel?: string;
}) {
    const [payload, setPayload] = useState<Payload | null>(null);
    const [hits, setHits] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [isInvalidating, startInvalidate] = useTransition();

    async function fetchNow() {
        setIsFetching(true);
        try {
            const res = await fetch(url, { cache: 'no-store' });
            const data = (await res.json()) as Payload;
            setPayload(data);
            setHits(h => h + 1);
        } finally {
            setIsFetching(false);
        }
    }

    function invalidateAndRefetch() {
        if (!onInvalidate) return;
        startInvalidate(async () => {
            await onInvalidate();
            await fetchNow();
        });
    }

    const palette =
        accent === 'sky'
            ? {
                  border: 'border-sky-500/30',
                  bg: 'bg-sky-500/5',
                  badge: 'text-sky-300',
                  code: 'text-sky-200',
                  btn: 'border-sky-500/50 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25',
              }
            : {
                  border: 'border-violet-500/30',
                  bg: 'bg-violet-500/5',
                  badge: 'text-violet-300',
                  code: 'text-violet-200',
                  btn: 'border-violet-500/50 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25',
              };

    return (
        <div className={`space-y-3 rounded-lg border ${palette.border} ${palette.bg} p-4`}>
            <div className='flex items-start justify-between gap-2'>
                <code className={`font-mono text-[11px] ${palette.code}`}>
                    {label}
                </code>
                <span className={`text-[10px] tracking-wide ${palette.badge} uppercase`}>
                    hits · {hits}
                </span>
            </div>

            {payload ? (
                <dl className='space-y-1 text-[11px]'>
                    <div className='flex gap-2'>
                        <dt className='w-16 shrink-0 text-slate-500'>
                            {nonceLabel}
                        </dt>
                        <dd className='font-mono text-amber-200'>
                            {payload.nonce}
                        </dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='w-16 shrink-0 text-slate-500'>now</dt>
                        <dd className='font-mono text-slate-200'>
                            {payload.now}
                        </dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='w-16 shrink-0 text-slate-500'>unixMs</dt>
                        <dd className='font-mono text-slate-300'>
                            {payload.unixMs}
                        </dd>
                    </div>
                </dl>
            ) : (
                <p className='text-[11px] text-slate-500'>—</p>
            )}

            <div className='flex flex-wrap gap-2'>
                <button
                    type='button'
                    onClick={fetchNow}
                    disabled={isFetching || isInvalidating}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${palette.btn}`}
                >
                    {isFetching ? fetchingLabel : refetchLabel}
                </button>
                {onInvalidate && invalidateLabel && invalidatingLabel && (
                    <button
                        type='button'
                        onClick={invalidateAndRefetch}
                        disabled={isFetching || isInvalidating}
                        className='inline-flex items-center gap-2 rounded-md border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {isInvalidating ? invalidatingLabel : invalidateLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function CacheCompare({ labels }: { labels: CacheLabels }) {
    return (
        <section className='space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4'>
            <div className='flex items-start justify-between gap-3'>
                <span className='text-[11px] font-semibold tracking-wide text-amber-300 uppercase'>
                    {labels.badge}
                </span>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {labels.description}
            </p>
            <div className='grid gap-3 sm:grid-cols-2'>
                <CacheBox
                    label={labels.dynamicLabel}
                    accent='sky'
                    url='/api/now-dynamic'
                    refetchLabel={labels.refetchLabel}
                    fetchingLabel={labels.fetchingLabel}
                    nonceLabel={labels.nonceLabel}
                />
                <CacheBox
                    label={labels.staticLabel}
                    accent='violet'
                    url='/api/now-static'
                    refetchLabel={labels.refetchLabel}
                    fetchingLabel={labels.fetchingLabel}
                    nonceLabel={labels.nonceLabel}
                    onInvalidate={invalidateNowStaticAction}
                    invalidateLabel={labels.invalidateLabel}
                    invalidatingLabel={labels.invalidatingLabel}
                />
            </div>
            <p className='rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] leading-relaxed text-amber-200/90'>
                {labels.devNote}
            </p>
        </section>
    );
}
