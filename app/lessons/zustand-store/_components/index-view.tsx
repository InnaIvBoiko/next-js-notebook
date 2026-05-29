'use client';
// =============================================================================
// app/lessons/zustand-store/_components/index-view.tsx
// Client UI for /lessons/zustand-store — reads the SHARED language Context
// from upstream (/lessons/layout.tsx) and orchestrates the two labs.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import ThemeBulk from './theme-bulk';
import ThemeControls from './theme-controls';
import ThemePreview from './theme-preview';
import TodoClear from './todo-clear';
import TodoInput from './todo-input';
import TodoList from './todo-list';
import TodoStats from './todo-stats';

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

            {/* §1 — what is Zustand */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.whatIs.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.whatIs.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.whatIs.snippet}
                </pre>
            </section>

            {/* §2 — module vs factory */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.moduleVsFactory.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.moduleVsFactory.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.moduleVsFactory.snippet}
                </pre>
            </section>

            {/* §3 — selectors */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.selectors.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.selectors.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.selectors.snippet}
                </pre>
            </section>

            {/* §4 — middleware */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.middleware.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.middleware.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-[11px] leading-relaxed text-amber-100'>
                    {t.sections.middleware.snippet}
                </pre>
            </section>

            {/* LAB 1 — Theme mirror */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.themeLab.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.themeLab.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-3'>
                    <ThemePreview
                        readerLabel={t.themeLab.readerBadge}
                        readerNote={t.themeLab.readerNote}
                        body={t.themeLab.previewBody}
                        renderLabel={t.themeLab.renderLabel}
                    />
                    <ThemeControls
                        writerLabel={t.themeLab.writerBadge}
                        writerNote={t.themeLab.writerNote}
                        themeLabel={t.themeLab.themeLabel}
                        themes={t.themeLab.themes}
                        renderLabel={t.themeLab.renderLabel}
                    />
                    <ThemeBulk
                        bulkLabel={t.themeLab.bulkBadge}
                        bulkNote={t.themeLab.bulkNote}
                        themeLabel={t.themeLab.themeLabel}
                        themes={t.themeLab.themes}
                        renderLabel={t.themeLab.renderLabel}
                    />
                </div>
            </section>

            {/* LAB 2 — Todo store */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.todoLab.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.todoLab.description}
                </p>
                <div className='grid gap-4 lg:grid-cols-2'>
                    <TodoInput
                        placeholder={t.todoLab.placeholder}
                        addLabel={t.todoLab.addLabel}
                        badgeLabel={t.todoLab.inputLabel}
                        renderLabel={t.todoLab.renderLabel}
                    />
                    <TodoClear
                        clearLabel={t.todoLab.clearLabel}
                        badgeLabel={t.todoLab.clearBadgeLabel}
                        renderLabel={t.todoLab.renderLabel}
                    />
                    <TodoStats
                        statsLabel={t.todoLab.statsLabel}
                        totalLabel={t.todoLab.totalLabel}
                        doneLabel={t.todoLab.doneLabel}
                        pendingLabel={t.todoLab.pendingLabel}
                        renderLabel={t.todoLab.renderLabel}
                    />
                    <TodoList
                        listLabel={t.todoLab.listLabel}
                        emptyLabel={t.todoLab.emptyLabel}
                        renderLabel={t.todoLab.renderLabel}
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
                            <span className='whitespace-pre-line'>{step}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </article>
    );
}
