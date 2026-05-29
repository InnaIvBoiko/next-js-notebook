'use client';
// Client view for the main lesson page.
// Reads the lang from the layout's Context and renders the localized prose.
// The file tree and the inline code snippets are kept language-neutral.

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const FILE_TREE = `app/
├── layout.tsx                → root layout
├── page.tsx                  → /
└── lessons/
    ├── layout.tsx            → guscio per ogni /lessons/*
    ├── _components/          → cartella privata (prefisso _)
    │   └── persistence-probe.tsx
    └── routing-basics/
        ├── layout.tsx        → guscio per /routing-basics/* (lang provider)
        ├── page.tsx          → /lessons/routing-basics
        ├── a/page.tsx        → /lessons/routing-basics/a
        └── b/page.tsx        → /lessons/routing-basics/b`;

export default function MainView() {
    const { lang } = useLessonLang();
    const t = content[lang].main;

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

            {/* §1 — Folder → URL */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.mapping.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.mapping.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {FILE_TREE}
                </pre>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.mapping.postscript}
                </p>
            </section>

            {/* §2 — Layout persistence (with sub-route nav) */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.persistence.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.persistence.description}
                </p>
                <div className='flex flex-wrap gap-3'>
                    <Link
                        href='/lessons/routing-basics/a'
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                    >
                        {t.sections.persistence.goToA}
                    </Link>
                    <Link
                        href='/lessons/routing-basics/b'
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                    >
                        {t.sections.persistence.goToB}
                    </Link>
                </div>
            </section>

            {/* §3 — Link vs <a> */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.linkVsAnchor.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.linkVsAnchor.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                        <p className='mb-2 text-xs font-semibold tracking-wide text-emerald-300 uppercase'>
                            {t.sections.linkVsAnchor.goodLabel}
                        </p>
                        <Link
                            href='/'
                            className='inline-block rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-400'
                        >
                            {t.sections.linkVsAnchor.goodCta}
                        </Link>
                        <p className='mt-2 text-xs text-slate-400'>
                            {t.sections.linkVsAnchor.goodNote}
                        </p>
                    </div>
                    <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4'>
                        <p className='mb-2 text-xs font-semibold tracking-wide text-amber-300 uppercase'>
                            {t.sections.linkVsAnchor.badLabel}
                        </p>
                        {/* INTENTIONAL plain <a>: this is the "bad" side
                            of the §3 Link vs <a> demo. Disabling Next's
                            ESLint rule for this single line. */}
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a
                            href='/'
                            className='inline-block rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-400'
                        >
                            {t.sections.linkVsAnchor.badCta}
                        </a>
                        <p className='mt-2 text-xs text-slate-400'>
                            {t.sections.linkVsAnchor.badNote}
                        </p>
                    </div>
                </div>
            </section>

            {/* §4 — Special files cheatsheet */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.specialFiles.heading}
                </h2>
                <ul className='space-y-2 text-sm text-slate-300'>
                    {t.sections.specialFiles.items.map(item => (
                        <li key={item.code}>
                            <code className='font-mono text-sky-300'>
                                {item.code}
                            </code>{' '}
                            — {item.description}
                        </li>
                    ))}
                </ul>
            </section>
        </article>
    );
}
