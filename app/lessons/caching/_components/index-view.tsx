'use client';
// =============================================================================
// IndexView — the lesson hub at /lessons/caching.
// =============================================================================

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const DEMO_ORDER = ['baseline', 'cached', 'reactCache'] as const;
type DemoKey = (typeof DEMO_ORDER)[number];

const DEMO_SLUG: Record<DemoKey, string> = {
    baseline: 'baseline',
    cached: 'cached',
    reactCache: 'react-cache',
};

const DEMO_ACCENT: Record<DemoKey, string> = {
    baseline:
        'border-slate-500/30 bg-slate-500/5 hover:border-slate-400/50 hover:bg-slate-500/10',
    cached: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10',
    reactCache:
        'border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10',
};

const DEMO_EMOJI: Record<DemoKey, string> = {
    baseline: '🪞',
    cached: '🧊',
    reactCache: '♻️',
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

            {/* §1 — use cache */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.useCache.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.useCache.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {t.sections.useCache.snippet}
                </pre>
            </section>

            {/* §2 — cacheLife */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.cacheLife.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.cacheLife.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-xs leading-relaxed text-emerald-100'>
                    {t.sections.cacheLife.snippet}
                </pre>
                <p className='text-xs leading-relaxed text-slate-500'>
                    {t.sections.cacheLife.postscript}
                </p>
            </section>

            {/* §3 — React.cache */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.reactCache.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.reactCache.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-xs leading-relaxed text-violet-100'>
                    {t.sections.reactCache.snippet}
                </pre>
                <p className='text-xs leading-relaxed text-slate-500'>
                    {t.sections.reactCache.postscript}
                </p>
            </section>

            {/* §4 — cache key */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.cacheKey.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.cacheKey.description}
                </p>
                <p className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200'>
                    {t.sections.cacheKey.postscript}
                </p>
            </section>

            {/* §5 — cacheTag + revalidateTag (forward reference) */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.tagInvalidation.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.tagInvalidation.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {t.sections.tagInvalidation.snippet}
                </pre>
                <p className='text-xs leading-relaxed text-slate-500 italic'>
                    {t.sections.tagInvalidation.forward}
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
                        const slug = DEMO_SLUG[key];
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
                                            /{slug}
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
