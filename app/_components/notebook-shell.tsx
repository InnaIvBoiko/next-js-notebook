'use client';
// ^^^^^^^^^^^
// The `'use client'` directive marks the BOUNDARY between the Server and the
// Client module graph. Everything imported from this file ends up in the
// client bundle. We need it here because we use `useState` (reactive language
// selection).
//
// 📚 See node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md

import { useState } from 'react';
import Link from 'next/link';
import { LANGS, dictionaries, type Lang } from '../_lib/dictionaries';

// -----------------------------------------------------------------------------
// LanguageSwitcher — interactive Client sub-component ("island")
// -----------------------------------------------------------------------------
function LanguageSwitcher({
    current,
    onChange,
}: {
    current: Lang;
    onChange: (lang: Lang) => void;
}) {
    return (
        <div
            role='radiogroup'
            aria-label='Language'
            className='inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 p-1 backdrop-blur'
        >
            {LANGS.map(l => {
                const active = l.code === current;
                return (
                    <button
                        key={l.code}
                        role='radio'
                        aria-checked={active}
                        onClick={() => onChange(l.code)}
                        className={[
                            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                            'flex items-center gap-1.5',
                            active
                                ? 'bg-sky-500 text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                        ].join(' ')}
                    >
                        <span aria-hidden>{l.flag}</span>
                        <span className='hidden sm:inline'>{l.label}</span>
                        <span className='uppercase sm:hidden'>{l.code}</span>
                    </button>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------------
// StatusBadge — lesson status pill (done/next/locked)
// -----------------------------------------------------------------------------
function StatusBadge({
    status,
    label,
}: {
    status: 'done' | 'next' | 'locked';
    label: string;
}) {
    const styles = {
        done: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30',
        next: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30',
        locked: 'bg-slate-700/30 text-slate-400 ring-1 ring-slate-600/40',
    }[status];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${styles}`}
        >
            {status === 'done' && '✓'}
            {status === 'next' && '→'}
            {status === 'locked' && '·'}
            {label}
        </span>
    );
}

// -----------------------------------------------------------------------------
// NotebookShell — main Client component
// -----------------------------------------------------------------------------
export default function NotebookShell() {
    // Language state: Italian by default (user requirement).
    const [lang, setLang] = useState<Lang>('it');

    // "Current" dictionary — re-derived on every render when `lang` changes.
    // `t` is a deep object — access strings as `t.hero.title`.
    const t = dictionaries[lang];

    // Find the next lesson (status === "next") to point the primary CTA at.
    const nextLesson = t.modules
        .flatMap(m => m.lessons)
        .find(l => l.status === 'next');

    return (
        <div className='min-h-full bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'>
            {/* HEADER — sticky, holds brand + language switcher */}
            <header className='sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur'>
                <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
                    <div className='flex items-center gap-2'>
                        <span className='inline-block h-2 w-2 rounded-full bg-sky-400' />
                        <span className='text-sm font-semibold tracking-tight text-slate-200'>
                            {t.brand}
                        </span>
                    </div>
                    <LanguageSwitcher current={lang} onChange={setLang} />
                </div>
            </header>

            {/* HERO — mobile-first: tighter padding, centered text on mobile */}
            <section className='mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-14 lg:px-8 lg:pt-24'>
                <div className='flex flex-col items-start gap-4 sm:gap-5'>
                    <span className='rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300'>
                        {t.hero.eyebrow}
                    </span>
                    <h1 className='text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
                        {t.hero.title}{' '}
                        <span className='bg-linear-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent'>
                            {t.hero.titleAccent}
                        </span>
                    </h1>
                    <p className='max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg'>
                        {t.hero.subtitle}
                    </p>

                    {/* CTAs — mobile-first: vertical stack, side-by-side from sm+ */}
                    <div className='mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                        {nextLesson && (
                            <Link
                                href={`/lessons/${nextLesson.slug}`}
                                className='inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-colors hover:bg-sky-400'
                            >
                                {t.hero.ctaStart}
                                <span aria-hidden>→</span>
                            </Link>
                        )}
                        <a
                            href='#roadmap'
                            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                        >
                            {t.hero.ctaRoadmap}
                        </a>
                    </div>
                </div>
            </section>

            {/* ABOUT — short descriptive section */}
            <section className='mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8'>
                <div className='rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-6'>
                    <h2 className='text-lg font-semibold text-slate-100 sm:text-xl'>
                        {t.about.title}
                    </h2>
                    <p className='mt-2 text-sm leading-relaxed text-slate-400 sm:text-base'>
                        {t.about.body}
                    </p>
                </div>
            </section>

            {/* ROADMAP — 5-module grid, mobile-first
          mobile: 1 column · sm: 2 columns · lg: 3 columns */}
            <section
                id='roadmap'
                className='mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8'
            >
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {t.modules.map(m => (
                        <article
                            key={m.id}
                            className='group rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 transition-colors hover:border-slate-700 hover:bg-slate-900/60'
                        >
                            <div className='flex items-baseline gap-2'>
                                <span className='font-mono text-xs text-sky-400'>
                                    {m.id}
                                </span>
                                <h3 className='text-base font-semibold text-slate-100'>
                                    {m.title}
                                </h3>
                            </div>
                            <p className='mt-1 text-sm text-slate-400'>
                                {m.description}
                            </p>

                            <ul className='mt-4 space-y-2'>
                                {m.lessons.map(lesson => {
                                    const isInteractive =
                                        lesson.status !== 'locked';
                                    const content = (
                                        <span
                                            className={[
                                                'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                                isInteractive
                                                    ? 'text-slate-200 hover:bg-slate-800/60'
                                                    : 'text-slate-500',
                                            ].join(' ')}
                                        >
                                            <span className='truncate font-mono text-xs'>
                                                /{lesson.slug}
                                            </span>
                                            <StatusBadge
                                                status={lesson.status}
                                                label={t.status[lesson.status]}
                                            />
                                        </span>
                                    );

                                    return (
                                        <li key={lesson.slug}>
                                            {isInteractive ? (
                                                <Link
                                                    href={`/lessons/${lesson.slug}`}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                content
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className='border-t border-slate-800/60'>
                <div className='mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6 lg:px-8'>
                    {t.footer}
                </div>
            </footer>
        </div>
    );
}
