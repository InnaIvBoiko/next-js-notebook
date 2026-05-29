'use client';
// =============================================================================
// IndexView — the lesson hub at /lessons/server-actions.
// =============================================================================

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const DEMO_ORDER = ['form', 'programmatic', 'revalidate'] as const;
type DemoKey = (typeof DEMO_ORDER)[number];

const DEMO_ACCENT: Record<DemoKey, string> = {
    form: 'border-sky-500/30 bg-sky-500/5 hover:border-sky-400/50 hover:bg-sky-500/10',
    programmatic:
        'border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10',
    revalidate:
        'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10',
};

const DEMO_EMOJI: Record<DemoKey, string> = {
    form: '📮',
    programmatic: '🖱️',
    revalidate: '♻️',
};

export default function IndexView() {
    const { lang } = useLessonLang();
    const t = content[lang].index;

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

            {/* §1 — 'use server' directive */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.directive.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.directive.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {t.sections.directive.snippet}
                </pre>
            </section>

            {/* §2 — Invocation patterns */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.invocation.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.invocation.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                        {t.sections.invocation.formSnippet}
                    </pre>
                    <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                        {t.sections.invocation.clickSnippet}
                    </pre>
                </div>
            </section>

            {/* §3 — Cache invalidation */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.invalidation.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.invalidation.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-xs leading-relaxed text-emerald-100'>
                    {t.sections.invalidation.snippet}
                </pre>
            </section>

            {/* §4 — Cookies */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.cookies.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.cookies.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-xs leading-relaxed text-amber-100'>
                    {t.sections.cookies.snippet}
                </pre>
            </section>

            {/* §5 — Security */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.security.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.security.description}
                </p>
                <p className='rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs leading-relaxed text-rose-200'>
                    {t.sections.security.postscript}
                </p>
            </section>

            {/* Forward reference */}
            <section className='rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 text-xs leading-relaxed text-slate-400 italic'>
                {t.sections.pendingForward}
            </section>

            {/* DEMOS */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.demosHeading}
                </h2>
                <ul className='grid gap-3 sm:grid-cols-3'>
                    {DEMO_ORDER.map(key => {
                        const demo = t.demos[key];
                        return (
                            <li key={key}>
                                <Link
                                    href={demo.route}
                                    className={`group flex h-full flex-col gap-2 rounded-lg border p-4 transition-colors ${DEMO_ACCENT[key]}`}
                                >
                                    <div className='flex items-baseline justify-between gap-2'>
                                        <span className='text-2xl' aria-hidden>
                                            {DEMO_EMOJI[key]}
                                        </span>
                                        <span className='font-mono text-[10px] tracking-wide text-slate-500 uppercase'>
                                            /{key}
                                        </span>
                                    </div>
                                    <h3 className='text-sm font-semibold text-slate-100'>
                                        {demo.label}
                                    </h3>
                                    <p className='text-xs text-slate-400'>
                                        {demo.description}
                                    </p>
                                    <span className='mt-auto inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition-colors group-hover:text-sky-300'>
                                        →
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </article>
    );
}
