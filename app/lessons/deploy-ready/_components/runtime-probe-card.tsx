'use client';
// =============================================================================
// app/lessons/deploy-ready/_components/runtime-probe-card.tsx
// CLIENT COMPONENT — Lab 2.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// Two panes side by side:
//   • LEFT  — the local snapshot, computed by the server and passed in as a
//             prop. No fetch; this is a true server-rendered value.
//   • RIGHT — fetched at MOUNT time from the deployed origin
//             (https://next-js-notebook.vercel.app/api/runtime-probe).
//             That endpoint is the EXACT SAME route handler — proving
//             "build once, deploy many".
//
// 🧠 USE EFFECT VS RSC FETCH
// We deliberately use `useEffect` (not a Server fetch) for the right pane
// because: (1) we want it to be a CLIENT-INITIATED cross-origin call,
// observable in DevTools → Network as a fetch the user triggered; (2) the
// data IS request-time + cross-origin, which a Server Component can't do
// without leaking CORS concerns into the page's own response.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

export type ProbeData = {
    runtime: 'nodejs';
    nodeVersion: string | null;
    timestamp: string;
    uptimeSeconds: number | null;
    nodeEnv: string | null;
    vercel: {
        env: string | null;
        region: string | null;
        url: string | null;
        sha: string | null;
        sha7: string | null;
        branch: string | null;
    };
};

type Labels = {
    badge: string;
    title: string;
    description: string;
    localHeading: string;
    liveHeading: string;
    refreshLabel: string;
    loadingLabel: string;
    errorLabel: string;
    fields: {
        runtime: string;
        nodeVersion: string;
        timestamp: string;
        uptime: string;
        nodeEnv: string;
        vercelEnv: string;
        vercelRegion: string;
        vercelSha: string;
        vercelBranch: string;
        vercelUrl: string;
    };
    notSet: string;
    localHint: string;
    liveHint: string;
};

export default function RuntimeProbeCard({
    localProbe,
    liveOrigin,
    labels,
}: {
    localProbe: ProbeData;
    liveOrigin: string;
    labels: Labels;
}) {
    return (
        <section className='space-y-3'>
            <div className='flex items-center gap-2'>
                <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                    {labels.badge}
                </span>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {labels.title}
                </h2>
            </div>
            <p className='text-sm leading-relaxed text-slate-400'>
                {labels.description}
            </p>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <LocalPane data={localProbe} labels={labels} />
                <LivePane origin={liveOrigin} labels={labels} />
            </div>
        </section>
    );
}

// -----------------------------------------------------------------------------
// LEFT PANE — local (server-computed at request time)
// -----------------------------------------------------------------------------
function LocalPane({ data, labels }: { data: ProbeData; labels: Labels }) {
    return (
        <article className='rounded-lg border border-slate-700/60 bg-slate-900/40 p-4'>
            <header className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-emerald-300'>
                    {labels.localHeading}
                </h3>
                <span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/30'>
                    SSR
                </span>
            </header>
            <ProbeFields data={data} labels={labels} />
            <p className='mt-3 text-[11px] text-slate-500'>{labels.localHint}</p>
        </article>
    );
}

// -----------------------------------------------------------------------------
// RIGHT PANE — live (cross-origin fetch to Vercel deploy)
// -----------------------------------------------------------------------------
function LivePane({ origin, labels }: { origin: string; labels: Labels }) {
    const [state, setState] = useState<
        | { status: 'idle' }
        | { status: 'loading' }
        | { status: 'ok'; data: ProbeData }
        | { status: 'error'; message: string }
    >({ status: 'idle' });

    // Manual refresh path — only the user-clicked button uses the
    // 'loading' status explicitly. Keeping setState OUT of the effect body
    // satisfies react-hooks/set-state-in-effect (cascading-renders rule).
    const refresh = useCallback(async () => {
        setState({ status: 'loading' });
        try {
            const res = await fetch(`${origin}/api/runtime-probe`, {
                cache: 'no-store',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as ProbeData;
            setState({ status: 'ok', data });
        } catch (err) {
            setState({
                status: 'error',
                message: err instanceof Error ? err.message : String(err),
            });
        }
    }, [origin]);

    // Initial fetch on mount — transitions silently from 'idle' to 'ok' or
    // 'error'. We never sync-setState here (the only setState calls happen
    // AFTER the await, i.e. in a microtask), so the lint rule is satisfied.
    // Cancellation flag avoids "set state on unmounted" if the user navigates
    // away mid-flight.
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch(`${origin}/api/runtime-probe`, {
                    cache: 'no-store',
                });
                if (cancelled) return;
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as ProbeData;
                if (cancelled) return;
                setState({ status: 'ok', data });
            } catch (err) {
                if (cancelled) return;
                setState({
                    status: 'error',
                    message:
                        err instanceof Error ? err.message : String(err),
                });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [origin]);

    return (
        <article className='rounded-lg border border-sky-500/30 bg-sky-500/5 p-4'>
            <header className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-sky-300'>
                    {labels.liveHeading}
                </h3>
                <button
                    type='button'
                    onClick={refresh}
                    disabled={state.status === 'loading'}
                    className='rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                >
                    {state.status === 'loading'
                        ? labels.loadingLabel
                        : labels.refreshLabel}
                </button>
            </header>

            {state.status === 'idle' || state.status === 'loading' ? (
                <div className='space-y-2'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className='h-4 w-full animate-pulse rounded bg-slate-800/60'
                        />
                    ))}
                </div>
            ) : state.status === 'error' ? (
                <div className='rounded border border-rose-500/40 bg-rose-500/10 p-3 text-[11px] text-rose-300'>
                    <div className='font-semibold'>{labels.errorLabel}</div>
                    <div className='mt-1 font-(--font-mono)'>{state.message}</div>
                </div>
            ) : (
                <>
                    <ProbeFields data={state.data} labels={labels} />
                    <p className='mt-3 text-[11px] text-sky-400/80'>
                        {labels.liveHint}
                    </p>
                </>
            )}
        </article>
    );
}

// -----------------------------------------------------------------------------
// Shared field table
// -----------------------------------------------------------------------------
function ProbeFields({ data, labels }: { data: ProbeData; labels: Labels }) {
    const rows: { label: string; value: string | null; mono?: boolean }[] = [
        { label: labels.fields.runtime, value: data.runtime, mono: true },
        { label: labels.fields.nodeVersion, value: data.nodeVersion, mono: true },
        { label: labels.fields.nodeEnv, value: data.nodeEnv, mono: true },
        {
            label: labels.fields.uptime,
            value:
                data.uptimeSeconds === null
                    ? null
                    : data.uptimeSeconds.toFixed(1),
            mono: true,
        },
        { label: labels.fields.vercelEnv, value: data.vercel.env, mono: true },
        {
            label: labels.fields.vercelRegion,
            value: data.vercel.region,
            mono: true,
        },
        { label: labels.fields.vercelSha, value: data.vercel.sha7, mono: true },
        {
            label: labels.fields.vercelBranch,
            value: data.vercel.branch,
            mono: true,
        },
        { label: labels.fields.vercelUrl, value: data.vercel.url, mono: true },
        {
            label: labels.fields.timestamp,
            value: new Date(data.timestamp).toLocaleTimeString(),
        },
    ];

    return (
        <dl className='grid grid-cols-3 gap-x-3 gap-y-1.5 text-[12px]'>
            {rows.map((r) => (
                <div key={r.label} className='col-span-3 grid grid-cols-3 gap-3'>
                    <dt className='col-span-1 truncate text-slate-500'>
                        {r.label}
                    </dt>
                    <dd
                        className={`col-span-2 truncate ${
                            r.value === null
                                ? 'text-slate-600 italic'
                                : 'text-slate-200'
                        } ${r.mono ? 'font-(--font-mono)' : ''}`}
                        title={r.value ?? labels.notSet}
                    >
                        {r.value ?? labels.notSet}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
