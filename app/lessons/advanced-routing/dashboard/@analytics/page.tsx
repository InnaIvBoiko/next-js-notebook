// =============================================================================
// app/lessons/advanced-routing/dashboard/@analytics/page.tsx
// `analytics` slot — async server component with an artificial delay so the
// streaming behaviour of parallel slots is visible to the eye.
// -----------------------------------------------------------------------------
// 🧠 await connection() + delay
// `connection()` opts this slot into request-time rendering. With Cache
// Components enabled, ALL slots at the same level must agree on rendering
// mode — both this and @team are dynamic so the dashboard layout is happy.
// Switch one to static and you'd get a build error.
//
// 🧠 i18n
// Reads `nb-lang` cookie via `getLessonLang()` and picks the right dictionary
// slice. The KPI labels (DAU, p95 LCP, 5xx rate) stay in English: that's
// industry jargon and translating them would just hide what the lesson is
// actually about.
// =============================================================================

import { connection } from 'next/server';
import { content } from '../../_lib/content';
import { getLessonLang } from '../../_lib/lang';

async function sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
}

// KPI labels stay in English — they're industry jargon, not UI chrome.
// Only the surrounding chrome (slot badge, "This week", delays note) is
// translated via the lesson dictionary.
const KPIS = [
    { label: 'DAU', value: '12 348', delta: '+4.2%' },
    { label: 'p95 LCP', value: '1.8s', delta: '−12%' },
    { label: '5xx rate', value: '0.04%', delta: '−0.6 bps' },
];

export default async function AnalyticsSlot() {
    await connection();
    await sleep(1200); // simulate the slow query

    const lang = await getLessonLang();
    const t = content[lang].subroutes.dashboard;

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <span className='inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                    {t.analyticsSlot}
                </span>
                <span className='font-(--font-mono) text-[10px] text-slate-500'>
                    {t.delayedSuffix} 1.2s
                </span>
            </div>
            <h3 className='text-sm font-semibold text-slate-100'>
                {t.thisWeek}
            </h3>
            <ul className='space-y-2'>
                {KPIS.map((kpi) => (
                    <li
                        key={kpi.label}
                        className='flex items-center justify-between rounded bg-slate-950/40 px-3 py-2'
                    >
                        <span className='text-xs text-slate-400'>
                            {kpi.label}
                        </span>
                        <span className='flex items-center gap-2'>
                            <span className='font-(--font-mono) text-sm text-slate-100'>
                                {kpi.value}
                            </span>
                            <span className='font-(--font-mono) text-[11px] text-emerald-300'>
                                {kpi.delta}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
