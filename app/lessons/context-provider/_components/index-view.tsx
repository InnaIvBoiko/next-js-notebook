'use client';
// =============================================================================
// app/lessons/context-provider/_components/index-view.tsx
// Client UI for /lessons/context-provider — reads the SHARED language Context
// from upstream (/lessons/layout.tsx) and orchestrates the local Theme demo.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import ThemeCombined from './theme-combined';
import ThemeControls from './theme-controls';
import ThemePreview from './theme-preview';

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

            {/* §1 — what is a provider */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.whatIs.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.whatIs.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.whatIs.snippet}
                </pre>
            </section>

            {/* §2 — placement / lift refactor */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.placement.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.placement.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.placement.snippet}
                </pre>
            </section>

            {/* §3 — split contexts */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.split.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.split.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.split.snippet}
                </pre>
            </section>

            {/* §4 — persistence */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.persistence.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.persistence.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-[11px] leading-relaxed text-amber-100'>
                    {t.sections.persistence.snippet}
                </pre>
            </section>

            {/* LAB */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.lab.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.lab.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-3'>
                    <ThemePreview
                        readerLabel={t.lab.readerBadge}
                        readerNote={t.lab.readerNote}
                        body={t.lab.previewBody}
                        renderLabel={t.lab.renderLabel}
                    />
                    <ThemeControls
                        setterLabel={t.lab.setterBadge}
                        setterNote={t.lab.setterNote}
                        themeLabel={t.lab.themeLabel}
                        themes={t.lab.themes}
                        renderLabel={t.lab.renderLabel}
                    />
                    <ThemeCombined
                        combinedLabel={t.lab.combinedBadge}
                        combinedNote={t.lab.combinedNote}
                        themeLabel={t.lab.themeLabel}
                        themes={t.lab.themes}
                        renderLabel={t.lab.renderLabel}
                    />
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
