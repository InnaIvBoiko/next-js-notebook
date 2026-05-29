'use client';
// =============================================================================
// DetailView — Client view for /lessons/dynamic-routes/[id].
// -----------------------------------------------------------------------------
// The SERVER `[id]/page.tsx` does the heavy lifting:
//   - reads `params` (a Promise) with `await`
//   - calls findItem(id) and notFound() if missing
//   - exports metadata + generateStaticParams
// It then passes the already-resolved `item` here as a prop.
//
// This component only renders. It does NOT call use(params) — there is no
// reason to: the server has already resolved the dynamic segment. We simply
// read the lang from <LangProvider> (which is mounted above in the lesson
// layout) and pick the right translation off the item.
// =============================================================================

import Link from 'next/link';
import type { Item } from '../_lib/items';
import { items } from '../_lib/items';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

export default function DetailView({ item }: { item: Item }) {
    const { lang } = useLessonLang();
    const t = content[lang].detail;
    const tr = item.i18n[lang];

    // Compute prev/next item for in-list navigation. Using the array order.
    const idx = items.findIndex(i => i.id === item.id);
    const prev = idx > 0 ? items[idx - 1] : null;
    const next = idx < items.length - 1 ? items[idx + 1] : null;

    return (
        <article className='space-y-8'>
            {/* Top breadcrumb back to the list */}
            <div>
                <Link
                    href='/lessons/dynamic-routes'
                    className='inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100'
                >
                    {t.backToList}
                </Link>
            </div>

            {/* HEADER — emoji + title */}
            <header className='space-y-3'>
                <div className='flex items-baseline gap-3'>
                    <span className='text-4xl' aria-hidden>
                        {item.emoji}
                    </span>
                    <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                        {tr.title}
                    </h1>
                </div>
                {/* URL + params introspection box — visible proof of the binding */}
                <div className='grid gap-2 rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs sm:grid-cols-2'>
                    <div>
                        <span className='text-slate-500'>{t.urlLabel}: </span>
                        <span className='text-sky-300'>
                            /lessons/dynamic-routes/{item.id}
                        </span>
                    </div>
                    <div>
                        <span className='text-slate-500'>
                            {t.paramsLabel}:{' '}
                        </span>
                        <span className='text-emerald-300'>
                            {JSON.stringify({ id: item.id })}
                        </span>
                    </div>
                </div>
            </header>

            {/* §Synopsis */}
            <section className='space-y-2'>
                <h2 className='text-sm font-semibold tracking-wide text-slate-400 uppercase'>
                    {t.synopsisHeading}
                </h2>
                <p className='text-base leading-relaxed text-slate-300'>
                    {tr.synopsis}
                </p>
            </section>

            {/* §Body */}
            <section className='space-y-2'>
                <h2 className='text-sm font-semibold tracking-wide text-slate-400 uppercase'>
                    {t.bodyHeading}
                </h2>
                <p className='text-base leading-relaxed text-slate-300'>
                    {tr.body}
                </p>
            </section>

            {/* Prev / Next nav — same dynamic route, different param */}
            <nav className='flex items-center justify-between gap-3 border-t border-slate-800/60 pt-6'>
                <div>
                    {prev && (
                        <Link
                            href={`/lessons/dynamic-routes/${prev.id}`}
                            className='inline-flex flex-col items-start rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100'
                        >
                            <span className='text-[10px] tracking-wide text-slate-500 uppercase'>
                                {t.prevLabel}
                            </span>
                            <span className='font-medium'>
                                {prev.emoji} {prev.i18n[lang].title}
                            </span>
                        </Link>
                    )}
                </div>
                <div>
                    {next && (
                        <Link
                            href={`/lessons/dynamic-routes/${next.id}`}
                            className='inline-flex flex-col items-end rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100'
                        >
                            <span className='text-[10px] tracking-wide text-slate-500 uppercase'>
                                {t.nextLabel}
                            </span>
                            <span className='font-medium'>
                                {next.i18n[lang].title} {next.emoji}
                            </span>
                        </Link>
                    )}
                </div>
            </nav>
        </article>
    );
}
