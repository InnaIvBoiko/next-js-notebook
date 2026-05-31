'use client';
// =============================================================================
// app/lessons/optimization-media/_components/index-view.tsx
// Client UI orchestrating the theory sections + 3 labs of Module 5 · Lesson 1.
// -----------------------------------------------------------------------------
// Same pattern as the other lessons (middleware-logic, auth-setup, ...):
//   • `'use client'` only because we read the language via `useLang()`.
//   • Heavy media (the 3 demos) is rendered on the server and passed as
//     ReactNode slots — so the Client bundle stays tiny.
//   • All copy comes from the inline content dictionary keyed by `lang`.
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    sourceDemo: ReactNode;
    layoutDemo: ReactNode;
    fontDemo: ReactNode;
};

export default function IndexView({
    sourceDemo,
    layoutDemo,
    fontDemo,
}: Props) {
    const lang = useLang();
    const t = content[lang];

    return (
        <article className='space-y-10'>
            {/* HEADER */}
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

            {/* §1 — Pipeline */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.pipeline.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.pipeline.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] leading-relaxed text-sky-100 font-(--font-mono)'>
                    {t.sections.pipeline.snippet}
                </pre>
            </section>

            {/* §2 — Source A1 */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.sourceA1.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.sourceA1.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-[11px] leading-relaxed text-emerald-100 font-(--font-mono)'>
                    {t.sections.sourceA1.snippet}
                </pre>
            </section>

            {/* §2.1 — Source A2 */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.sourceA2.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.sourceA2.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] leading-relaxed text-sky-100 font-(--font-mono)'>
                    {t.sections.sourceA2.snippet}
                </pre>
            </section>

            {/* §2.2 — Source A3 */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.sourceA3.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.sourceA3.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-[11px] leading-relaxed text-violet-100 font-(--font-mono)'>
                    {t.sections.sourceA3.snippet}
                </pre>
            </section>

            {/* LAB 1 — Source demo (3 columns) */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.sourceDemo.badge}
                    </span>
                    <h2 className='text-xl font-semibold text-slate-100'>
                        {t.labs.heading}
                    </h2>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.sourceDemo.description}
                </p>
                {sourceDemo}
            </section>

            {/* §3 — Layout B1 */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.layoutB1.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.layoutB1.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-[11px] leading-relaxed text-cyan-100 font-(--font-mono)'>
                    {t.sections.layoutB1.snippet}
                </pre>
            </section>

            {/* §3.1 — Layout B2 */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.layoutB2.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.layoutB2.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-[11px] leading-relaxed text-amber-100 font-(--font-mono)'>
                    {t.sections.layoutB2.snippet}
                </pre>
            </section>

            {/* LAB 2 — Layout demo */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.layoutDemo.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.layoutDemo.description}
                </p>
                {layoutDemo}
            </section>

            {/* §4 — Fonts */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.fonts.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.fonts.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 text-[11px] leading-relaxed text-fuchsia-100 font-(--font-mono)'>
                    {t.sections.fonts.snippet}
                </pre>
            </section>

            {/* LAB 3 — Font demo */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.fontDemo.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.fontDemo.description}
                </p>
                {fontDemo}
            </section>

            {/* §5 — Decision table */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.decisionTable.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.decisionTable.intro}
                </p>
                <div className='overflow-x-auto rounded-lg border border-slate-700/60'>
                    <table className='w-full text-left text-sm'>
                        <tbody>
                            {t.decisionTable.rows.map((row, idx) => (
                                <tr
                                    key={row.scenario}
                                    className={
                                        idx % 2 === 0
                                            ? 'bg-slate-900/40'
                                            : 'bg-slate-900/20'
                                    }
                                >
                                    <td className='border-r border-slate-700/60 px-3 py-2 align-top text-slate-300'>
                                        {row.scenario}
                                    </td>
                                    <td className='px-3 py-2 align-top text-sky-200 font-(--font-mono) text-[12px]'>
                                        {row.choice}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* DEBUG LAB */}
            <section className='space-y-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.debug.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.debug.description}
                </p>
                <ol className='list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300 marker:text-rose-400'>
                    {t.debug.steps.map((step, idx) => (
                        <li key={idx} className='whitespace-pre-line'>
                            {step}
                        </li>
                    ))}
                </ol>
            </section>
        </article>
    );
}
