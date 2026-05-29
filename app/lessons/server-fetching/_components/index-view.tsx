'use client';
// =============================================================================
// IndexView — the lesson hub at /lessons/server-fetching.
// -----------------------------------------------------------------------------
// Renders the four prose sections, then links to the three live demos.
// =============================================================================

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const DEMO_ORDER = ['default', 'parallel', 'dynamic'] as const;

const DEMO_ACCENT: Record<(typeof DEMO_ORDER)[number], string> = {
    default:
        'border-sky-500/30 bg-sky-500/5 hover:border-sky-400/50 hover:bg-sky-500/10',
    parallel:
        'border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10',
    dynamic:
        'border-amber-500/30 bg-amber-500/5 hover:border-amber-400/50 hover:bg-amber-500/10',
};

const DEMO_EMOJI: Record<(typeof DEMO_ORDER)[number], string> = {
    default: '🌐',
    parallel: '⚡',
    dynamic: '🍪',
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

            {/* §1 — async RSC + await fetch */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.asyncRsc.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.asyncRsc.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {t.sections.asyncRsc.snippet}
                </pre>
            </section>

            {/* §2 — default uncached */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.defaultUncached.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.defaultUncached.description}
                </p>
                <p className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200'>
                    {t.sections.defaultUncached.postscript}
                </p>
            </section>

            {/* §3 — memoization */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.memoization.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.memoization.description}
                </p>
                <p className='rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed text-emerald-200'>
                    {t.sections.memoization.postscript}
                </p>
            </section>

            {/* §4 — dynamic via cookies/headers */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.dynamic.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.dynamic.description}
                </p>
                <p className='text-xs leading-relaxed text-slate-500'>
                    {t.sections.dynamic.postscript}
                </p>
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
                <p className='text-xs leading-relaxed text-slate-500 italic'>
                    {t.cachingForward}
                </p>
            </section>
        </article>
    );
}
