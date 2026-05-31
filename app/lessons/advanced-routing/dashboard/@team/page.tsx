// =============================================================================
// app/lessons/advanced-routing/dashboard/@team/page.tsx
// `team` slot — async render with a SHORTER delay than @analytics so the
// two slot skeletons replace at clearly different moments.
// -----------------------------------------------------------------------------
// 🧠 i18n
// Reads `nb-lang` cookie. Roles and statuses are localised via the dictionary
// (each PEOPLE row references a `roles.<key>` and `statuses.<key>` entry).
// Names stay flat — names don't translate.
// =============================================================================

import { connection } from 'next/server';
import { content } from '../../_lib/content';
import { getLessonLang } from '../../_lib/lang';

async function sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
}

// Each row points at a dictionary key for role/status instead of carrying the
// literal text. Translating only the labels keeps the name list short.
const PEOPLE = [
    { name: 'Inna B.', roleKey: 'lead', statusKey: 'reviewing' },
    { name: 'Marco R.', roleKey: 'designer', statusKey: 'tokens' },
    { name: 'Yulia K.', roleKey: 'pm', statusKey: 'planning' },
    { name: 'Felix L.', roleKey: 'sre', statusKey: 'onCall' },
] as const;

export default async function TeamSlot() {
    await connection();
    await sleep(600); // resolves before @analytics so you SEE the difference

    const lang = await getLessonLang();
    const t = content[lang].subroutes.dashboard;

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <span className='inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase'>
                    {t.teamSlot}
                </span>
                <span className='font-(--font-mono) text-[10px] text-slate-500'>
                    {t.delayedSuffix} 0.6s
                </span>
            </div>
            <h3 className='text-sm font-semibold text-slate-100'>
                {t.currentlyActive}
            </h3>
            <ul className='space-y-2'>
                {PEOPLE.map((p) => (
                    <li
                        key={p.name}
                        className='flex items-center justify-between rounded bg-slate-950/40 px-3 py-2'
                    >
                        <span className='flex flex-col'>
                            <span className='text-sm text-slate-100'>
                                {p.name}
                            </span>
                            <span className='text-[11px] text-slate-500'>
                                {t.roles[p.roleKey]}
                            </span>
                        </span>
                        <span className='font-(--font-mono) text-[11px] text-emerald-300'>
                            {t.statuses[p.statusKey]}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
