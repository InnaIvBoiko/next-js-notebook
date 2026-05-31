// =============================================================================
// app/lessons/deploy-ready/_components/preflight-checklist.tsx
// SERVER COMPONENT — Lab 3 slot.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// The server pre-computes `present: boolean` for each item by checking
// file existence with fs.stat, then passes the results to this component.
// No fs reading happens here — kept pure for render. This way the same
// list is rendered both at request time AND statically friendly (the
// page itself is Suspense-wrapped to satisfy Cache Components).
// =============================================================================

export type PreflightResult = {
    label: string;
    hint: string;
    present: boolean;
};

export default function PreflightChecklist({
    badge,
    title,
    description,
    okLabel,
    missingLabel,
    scoreLabel,
    results,
}: {
    badge: string;
    title: string;
    description: string;
    okLabel: string;
    missingLabel: string;
    scoreLabel: string;
    results: PreflightResult[];
}) {
    const passed = results.filter((r) => r.present).length;
    const total = results.length;
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);

    const scoreToneClass =
        score >= 90
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
            : score >= 60
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300';

    return (
        <section className='space-y-3'>
            <div className='flex items-center gap-2'>
                <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                    {badge}
                </span>
                <h2 className='text-xl font-semibold text-slate-100'>{title}</h2>
            </div>
            <p className='text-sm leading-relaxed text-slate-400'>{description}</p>

            {/* Score strip */}
            <div
                className={`flex items-baseline justify-between rounded-lg border px-4 py-3 ${scoreToneClass}`}
            >
                <span className='text-sm font-medium'>
                    {passed} / {total} · {scoreLabel}
                </span>
                <span className='font-(family-name:--font-mono) text-2xl font-bold'>
                    {score}%
                </span>
            </div>

            <ul className='divide-y divide-slate-800/60 overflow-hidden rounded-lg border border-slate-700/60'>
                {results.map((r) => (
                    <li
                        key={r.label}
                        className='flex items-start gap-3 bg-slate-900/30 p-3'
                    >
                        <span
                            aria-hidden
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                r.present
                                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                                    : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40'
                            }`}
                        >
                            {r.present ? '✓' : '✗'}
                        </span>
                        <div className='min-w-0 flex-1'>
                            <div className='flex items-baseline gap-2'>
                                <span className='text-sm text-slate-200'>
                                    {r.label}
                                </span>
                                <span
                                    className={`text-[10px] tracking-wide uppercase ${
                                        r.present
                                            ? 'text-emerald-400'
                                            : 'text-rose-400'
                                    }`}
                                >
                                    {r.present ? okLabel : missingLabel}
                                </span>
                            </div>
                            <div className='mt-0.5 truncate font-(--font-mono) text-[11px] text-slate-500'>
                                {r.hint}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
