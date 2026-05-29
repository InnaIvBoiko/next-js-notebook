'use client';
// =============================================================================
// IndexView — the list page for /lessons/dynamic-routes.
// -----------------------------------------------------------------------------
// Client component because it reads the language from <LangProvider>.
// All the actual prose/i18n lives in ../_lib/content.ts; the items live in
// ../_lib/items.ts. This component is presentation only.
// =============================================================================

import Link from 'next/link';
import { content } from '../_lib/content';
import { items } from '../_lib/items';
import { useLessonLang } from './lang-provider';

const FILE_TREE = `app/lessons/dynamic-routes/
├── layout.tsx              → lang chrome (LangProvider + LangBar)
├── page.tsx                → /lessons/dynamic-routes (this list)
├── _components/
├── _lib/
│   ├── items.ts            → mini "database" (4 items)
│   └── content.ts          → lesson copy in it/en/uk
└── [id]/
    ├── page.tsx            → /lessons/dynamic-routes/:id (detail)
    └── not-found.tsx       → segment-scoped 404 UI`;

export default function IndexView() {
    const { lang } = useLessonLang();
    const t = content[lang].index;
    const itemListLabel = content[lang].index.listSynopsisLabel;

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

            {/* §1 — Convention */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.convention.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.convention.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {FILE_TREE}
                </pre>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.convention.postscript}
                </p>
            </section>

            {/* §2 — params is a Promise */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.paramsPromise.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.paramsPromise.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                        {t.sections.paramsPromise.serverNote}
                    </pre>
                    <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                        {t.sections.paramsPromise.clientNote}
                    </pre>
                </div>
            </section>

            {/* §3 — generateStaticParams */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.staticParams.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.staticParams.description}
                </p>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.staticParams.postscript}
                </p>
            </section>

            {/* §4 — notFound */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.notFound.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.notFound.description}
                </p>
                <div className='flex flex-wrap gap-3'>
                    <Link
                        href='/lessons/dynamic-routes/1'
                        className='inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/15'
                    >
                        {t.sections.notFound.tryValid}
                    </Link>
                    <Link
                        href='/lessons/dynamic-routes/999'
                        className='inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 transition-colors hover:border-amber-400/60 hover:bg-amber-500/15'
                    >
                        {t.sections.notFound.tryInvalid}
                    </Link>
                </div>
            </section>

            {/* ITEM LIST — the producer side of the dynamic route */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.listHeading}
                </h2>
                <ul className='grid gap-3 sm:grid-cols-2'>
                    {items.map(item => {
                        const i18n = item.i18n[lang];
                        return (
                            <li key={item.id}>
                                <Link
                                    href={`/lessons/dynamic-routes/${item.id}`}
                                    className='group flex h-full flex-col gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/60'
                                >
                                    <div className='flex items-baseline justify-between gap-2'>
                                        <span className='text-2xl' aria-hidden>
                                            {item.emoji}
                                        </span>
                                        <span className='font-mono text-[10px] tracking-wide text-slate-500 uppercase'>
                                            /{item.id}
                                        </span>
                                    </div>
                                    <h3 className='text-base font-semibold text-slate-100'>
                                        {i18n.title}
                                    </h3>
                                    <p className='text-xs text-slate-500'>
                                        <span className='mr-1 font-mono uppercase'>
                                            {itemListLabel}:
                                        </span>
                                        <span className='text-slate-400'>
                                            {i18n.synopsis}
                                        </span>
                                    </p>
                                    <span className='mt-auto inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition-colors group-hover:text-sky-300'>
                                        {t.viewItem}{' '}
                                        <span aria-hidden>→</span>
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
