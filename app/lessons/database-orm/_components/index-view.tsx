'use client';
// =============================================================================
// app/lessons/database-orm/_components/index-view.tsx
// Client UI orchestrating the 6 sections + 3 labs of Module 4 · Lesson 2.
// -----------------------------------------------------------------------------
// 🧠 Why this is a Client Component despite rendering Server children
// `useLang()` is a Client hook, so the lesson copy + section accents need a
// Client parent. The labs themselves are passed in as JSX from `page.tsx`
// (a Server Component) — that's allowed: Server Components can render Client
// Components AND vice versa, as long as the boundary is crossed by passing
// children as props (not by direct import).
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    rscList: ReactNode;
    serverActionForm: ReactNode;
    clientList: ReactNode;
};

export default function IndexView({
    rscList,
    serverActionForm,
    clientList,
}: Props) {
    const lang = useLang();
    const t = content[lang];

    return (
        <article className='space-y-10'>
            <header className='space-y-3'>
                <span className='inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300'>
                    {t.badge}
                </span>
                <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                    {t.title}
                </h1>
                <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                    {t.intro}
                </p>
            </header>

            {/* §1 — Why an ORM */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.whyOrm.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.whyOrm.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.whyOrm.snippet}
                </pre>
            </section>

            {/* §2 — Schema */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.schema.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.schema.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.schema.snippet}
                </pre>
            </section>

            {/* §3 — Three callers */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.threeCallers.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.threeCallers.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.threeCallers.snippet}
                </pre>
            </section>

            {/* §4 — Transactions */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.transactions.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.transactions.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-[11px] leading-relaxed text-amber-100'>
                    {t.sections.transactions.snippet}
                </pre>
            </section>

            {/* §5 — Cache + RSC */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.cacheRsc.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.cacheRsc.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 font-mono text-[11px] leading-relaxed text-rose-100'>
                    {t.sections.cacheRsc.snippet}
                </pre>
            </section>

            {/* §6 — Decision table */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.decisionTable.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.decisionTable.intro}
                </p>
                <div className='overflow-hidden rounded-lg border border-slate-700/60'>
                    <table className='w-full text-sm'>
                        <tbody>
                            {t.decisionTable.rows.map((row, i) => (
                                <tr
                                    key={i}
                                    className={`border-t border-slate-800 first:border-t-0 ${i % 2 ? 'bg-slate-900/40' : ''}`}
                                >
                                    <td className='w-1/2 px-4 py-2 text-slate-300'>
                                        {row.scenario}
                                    </td>
                                    <td className='w-1/2 border-l border-slate-800 px-4 py-2 text-slate-100'>
                                        {row.choice}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* LABS */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.labs.heading}
                </h2>

                {/* Lab 1 — RSC direct read */}
                <div className='space-y-2 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                        <span className='text-[11px] font-semibold tracking-wide text-sky-300 uppercase'>
                            {t.labs.rscReader.badge}
                        </span>
                        <code className='rounded bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] text-sky-200'>
                            await listNotesWithTags()
                        </code>
                    </div>
                    <p className='text-xs leading-relaxed text-slate-400'>
                        {t.labs.rscReader.description}
                    </p>
                    {rscList}
                </div>

                {/* Lab 2 — Server Action */}
                <div className='space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                        <span className='text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                            {t.labs.serverAction.badge}
                        </span>
                        <code className='rounded bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] text-emerald-200'>
                            db.transaction()
                        </code>
                    </div>
                    <p className='text-xs leading-relaxed text-slate-400'>
                        {t.labs.serverAction.description}
                    </p>
                    {serverActionForm}
                </div>

                {/* Lab 3 — Client + TanStack */}
                <div className='space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                        <span className='text-[11px] font-semibold tracking-wide text-amber-300 uppercase'>
                            {t.labs.clientQuery.badge}
                        </span>
                        <code className='rounded bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] text-amber-200'>
                            GET /api/notes
                        </code>
                    </div>
                    <p className='text-xs leading-relaxed text-slate-400'>
                        {t.labs.clientQuery.description}
                    </p>
                    {clientList}
                </div>
            </section>

            {/* DEBUG */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.debug.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.debug.description}
                </p>
                <ol className='space-y-2 text-sm leading-relaxed text-slate-300'>
                    {t.debug.steps.map((step, i) => (
                        <li
                            key={i}
                            className='flex gap-3 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
                        >
                            <span className='shrink-0 font-mono text-xs text-sky-400'>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </article>
    );
}
