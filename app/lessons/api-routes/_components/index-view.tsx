'use client';
// =============================================================================
// app/lessons/api-routes/_components/index-view.tsx
// Client UI orchestrating the 6 sections + 3 labs of Module 4 · Lesson 1.
// -----------------------------------------------------------------------------
// This component reads the language from the lessons-wide LangProvider (lifted
// in app/lessons/layout.tsx) and renders the lesson content + the three labs.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import CacheCompare from './cache-compare';
import EchoPlayground from './echo-playground';
import NotesLab from './notes-lab';

export default function IndexView() {
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

            {/* §1 — Anatomy */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.anatomy.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.anatomy.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.anatomy.snippet}
                </pre>
            </section>

            {/* §2 — When NOT */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.whenNot.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.whenNot.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 font-mono text-[11px] leading-relaxed text-rose-100'>
                    {t.sections.whenNot.snippet}
                </pre>
            </section>

            {/* §3 — Dynamic params */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.dynamicParams.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.dynamicParams.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.dynamicParams.snippet}
                </pre>
            </section>

            {/* §4 — Body / status */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.body.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.body.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.body.snippet}
                </pre>
            </section>

            {/* §5 — Caching */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.caching.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.caching.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-[11px] leading-relaxed text-amber-100'>
                    {t.sections.caching.snippet}
                </pre>
            </section>

            {/* §6 — Decision Table */}
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
                <div className='space-y-4'>
                    <EchoPlayground labels={t.labs.echo} />
                    <NotesLab labels={t.labs.notes} />
                    <CacheCompare labels={t.labs.cache} />
                </div>
            </section>

            {/* DEBUG LAB */}
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
