'use client';
// ^^^^^^^^^^^
// 🧠 CLIENT ISLAND — wraps the entire lesson body.
//
// This component is itself a meta-demonstration of what the lesson teaches:
//
//   • `page.tsx` is a Server Component (entry).
//   • It pre-renders the three demo trees (ServerNow / ClientCounter /
//     ServerFact) on the server and hands them down here as `slots`.
//   • This Client island only manages the visible LANGUAGE and renders
//     the localized prose around the pre-rendered server slots.
//
// What this means in practice:
//   - Switching language is INSTANT (no navigation, no re-fetch).
//   - The demos do NOT re-render on language switch — they were rendered
//     once on the server. Their internal text stays in the base language.
//   - Full per-segment i18n (where even server output changes per lang)
//     is the job of `app/[lang]/...` and comes in Module 5.

import { useState, type ReactNode } from 'react';
import { LANGS, type Lang } from '../../../_lib/dictionaries';
import { content } from '../_lib/content';
import ClientCard from './client-card';

type Slots = {
    serverNow: ReactNode;
    clientCounter: ReactNode;
    serverFact: ReactNode;
};

export default function LessonShell({ slots }: { slots: Slots }) {
    // Local language state — defaults to Italian (project base language).
    // Switching here does NOT affect other pages: each lesson owns its lang.
    const [lang, setLang] = useState<Lang>('it');
    const t = content[lang];

    return (
        <article className='space-y-10'>
            {/* HEADER — badge, switcher, title, intro */}
            <header className='space-y-3'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                    <span className='inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300'>
                        {t.badge}
                    </span>
                    <LessonLangSwitcher current={lang} onChange={setLang} />
                </div>
                <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                    {t.title}
                </h1>
                <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                    {t.intro}
                </p>
            </header>

            {/* §1 — capabilities table */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.capabilities.heading}
                </h2>
                <div className='overflow-x-auto rounded-lg border border-slate-800/60'>
                    <table className='w-full text-sm'>
                        <thead className='bg-slate-900/60 text-xs tracking-wide text-slate-400 uppercase'>
                            <tr>
                                <th className='px-4 py-2 text-left font-medium'>
                                    {t.sections.capabilities.colCapability}
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-sky-300'>
                                    {t.sections.capabilities.colServer}
                                </th>
                                <th className='px-4 py-2 text-left font-medium text-violet-300'>
                                    {t.sections.capabilities.colClient}
                                </th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-800/60 text-slate-200'>
                            {t.sections.capabilities.rows.map(row => (
                                <tr key={row.capability}>
                                    <td className='px-4 py-2'>
                                        {row.capability}
                                    </td>
                                    <td className='px-4 py-2'>{row.server}</td>
                                    <td className='px-4 py-2'>{row.client}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.capabilities.footer}
                </p>
            </section>

            {/* §2 — side-by-side live demos (server-rendered slots) */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.sideBySide.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.sideBySide.description}
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-lg border border-sky-500/20 bg-sky-500/5 p-4'>
                        {slots.serverNow}
                    </div>
                    <div className='rounded-lg border border-violet-500/20 bg-violet-500/5 p-4'>
                        {slots.clientCounter}
                    </div>
                </div>
            </section>

            {/* §3 — boundary directive */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.boundary.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.boundary.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {`// app/.../client-counter.tsx
'use client';   ← BOUNDARY
import { useState } from 'react';

export default function ClientCounter() {
    const [n, setN] = useState(0);
    return <button onClick={() => setN(n + 1)}>{n}</button>;
}`}
                </pre>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.boundary.footer}
                </p>
            </section>

            {/* §4 — Server inside Client via children slot */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.childrenSlot.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.childrenSlot.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {`<ClientCard label="…">
    <ServerFact />          ← children: pre-rendered on the server
</ClientCard>`}
                </pre>
                <ClientCard label={t.sections.childrenSlot.cardLabel}>
                    {slots.serverFact}
                </ClientCard>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.childrenSlot.footer}
                </p>
            </section>

            {/* §5 — common pitfalls */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.pitfalls.heading}
                </h2>
                <ul className='space-y-3 text-sm text-slate-300'>
                    {t.sections.pitfalls.items.map(item => (
                        <li key={item.title}>
                            <strong className='text-amber-300'>
                                {item.title}
                            </strong>{' '}
                            {item.body}
                        </li>
                    ))}
                </ul>
            </section>
        </article>
    );
}

// -----------------------------------------------------------------------------
// LessonLangSwitcher — small pillola, mirrors the home's switcher style.
// -----------------------------------------------------------------------------
function LessonLangSwitcher({
    current,
    onChange,
}: {
    current: Lang;
    onChange: (lang: Lang) => void;
}) {
    return (
        <div
            role='radiogroup'
            aria-label='Lesson language'
            className='inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 p-1 backdrop-blur'
        >
            {LANGS.map(l => {
                const active = l.code === current;
                return (
                    <button
                        key={l.code}
                        type='button'
                        role='radio'
                        aria-checked={active}
                        onClick={() => onChange(l.code)}
                        className={[
                            'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase transition-colors',
                            active
                                ? 'bg-sky-500 text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                        ].join(' ')}
                    >
                        <span aria-hidden>{l.flag}</span>
                        <span>{l.code}</span>
                    </button>
                );
            })}
        </div>
    );
}
