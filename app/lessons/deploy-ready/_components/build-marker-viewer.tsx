// =============================================================================
// app/lessons/deploy-ready/_components/build-marker-viewer.tsx
// SERVER COMPONENT — Lab 1 slot.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// No 'use client' — this is a Server Component. It receives the
// pre-computed BuildSnapshot from page.tsx (which read it via the
// server-only manifest-reader). Rendering server-side keeps the fs
// reading off the client bundle and avoids any client-side fetch.
//
// 🧠 WHY PASS-AS-PROP INSTEAD OF READING HERE
// The parent IndexView is a Client Component — it can't import a server-only
// module. So page.tsx (Server) reads the manifest, then passes the result
// as a slot/prop. This is the canonical Server-into-Client pattern.
// =============================================================================

import type { BuildSnapshot, NoBuildSnapshot } from '../_lib/manifest-reader';

type Labels = {
    badge: string;
    title: string;
    description: string;
    noBuildHeading: string;
    noBuildHint: string;
    buildIdLabel: string;
    generatedAtLabel: string;
    routesHeading: string;
    staticLabel: string;
    isrLabel: string;
    countLabel: string;
};

export default function BuildMarkerViewer({
    snapshot,
    labels,
}: {
    snapshot: BuildSnapshot | NoBuildSnapshot;
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

            {snapshot.found ? (
                <FoundView snapshot={snapshot} labels={labels} />
            ) : (
                <NotFoundView labels={labels} />
            )}
        </section>
    );
}

function NotFoundView({ labels }: { labels: Labels }) {
    return (
        <div className='rounded-lg border border-rose-500/30 bg-rose-500/5 p-4'>
            <h3 className='text-sm font-semibold text-rose-300'>
                {labels.noBuildHeading}
            </h3>
            <p className='mt-1 text-sm whitespace-pre-line text-slate-400'>
                {labels.noBuildHint}
            </p>
            <pre className='mt-3 overflow-x-auto rounded border border-slate-700/60 bg-slate-950/60 p-3 font-(--font-mono) text-[11px] text-slate-300'>
                $ npm run build
            </pre>
        </div>
    );
}

function FoundView({
    snapshot,
    labels,
}: {
    snapshot: BuildSnapshot;
    labels: Labels;
}) {
    return (
        <div className='space-y-4'>
            {/* Header strip — buildId + generated-at + counts */}
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                <Stat label={labels.buildIdLabel} value={snapshot.buildId} mono />
                <Stat
                    label={labels.generatedAtLabel}
                    value={new Date(snapshot.generatedAtIso).toLocaleString()}
                />
                <Stat
                    label={labels.countLabel}
                    value={`${snapshot.totalStatic} ○ · ${snapshot.totalIsr} ISR · ${snapshot.totalDynamic} λ`}
                />
            </div>

            {/* Routes table */}
            <div>
                <h3 className='mb-2 text-sm font-semibold text-slate-200'>
                    {labels.routesHeading}
                </h3>
                <div className='overflow-x-auto rounded-lg border border-slate-700/60'>
                    <table className='w-full text-left text-sm'>
                        <tbody>
                            {snapshot.routes.length === 0 && (
                                <tr>
                                    <td className='px-3 py-3 text-slate-500 italic'>
                                        — empty —
                                    </td>
                                </tr>
                            )}
                            {snapshot.routes.map((r, idx) => (
                                <tr
                                    key={r.path}
                                    className={
                                        idx % 2 === 0
                                            ? 'bg-slate-900/40'
                                            : 'bg-slate-900/20'
                                    }
                                >
                                    <td className='border-r border-slate-700/60 px-3 py-2 align-top font-(--font-mono) text-[12px] text-slate-300'>
                                        {r.path}
                                    </td>
                                    <td className='border-r border-slate-700/60 px-3 py-2 align-top'>
                                        {r.kind === 'static' ? (
                                            <span className='inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/30'>
                                                ○ {labels.staticLabel}
                                            </span>
                                        ) : (
                                            <span className='inline-block rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300 ring-1 ring-sky-400/30'>
                                                ↻ {labels.isrLabel}
                                            </span>
                                        )}
                                    </td>
                                    <td className='px-3 py-2 align-top font-(--font-mono) text-[12px] text-slate-400'>
                                        {r.revalidateSeconds !== null
                                            ? `revalidate=${r.revalidateSeconds}s`
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Stat({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className='rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2'>
            <div className='text-[10px] tracking-wide text-slate-500 uppercase'>
                {label}
            </div>
            <div
                className={`mt-1 truncate text-sm text-slate-200 ${mono ? 'font-(--font-mono) text-[12px]' : ''}`}
                title={value}
            >
                {value}
            </div>
        </div>
    );
}
