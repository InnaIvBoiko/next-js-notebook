'use client';
// =============================================================================
// app/lessons/advanced-routing/_components/index-view.tsx
// Client orchestrator: theory sections + 3 lab cards linking to sub-routes.
// =============================================================================

import Link from 'next/link';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

const toneMap = {
    sky: 'border-sky-500/20 bg-sky-500/5 text-sky-100',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100',
    violet: 'border-violet-500/20 bg-violet-500/5 text-violet-100',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-100',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100',
    fuchsia: 'border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-100',
    rose: 'border-rose-500/20 bg-rose-500/5 text-rose-100',
} as const;

function Section({
    heading,
    description,
    snippet,
    tone,
}: {
    heading: string;
    description: string;
    snippet: string;
    tone: keyof typeof toneMap;
}) {
    return (
        <section className='space-y-3'>
            <h2 className='text-xl font-semibold text-slate-100'>{heading}</h2>
            <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                {description}
            </p>
            <pre
                className={`overflow-x-auto rounded-lg border p-4 font-(--font-mono) text-[11px] leading-relaxed ${toneMap[tone]}`}
            >
                {snippet}
            </pre>
        </section>
    );
}

export default function IndexView() {
    const lang = useLang();
    const t = content[lang];

    const labRoot = '/lessons/advanced-routing';

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

            <Section
                heading={t.sections.routeGroups.heading}
                description={t.sections.routeGroups.description}
                snippet={t.sections.routeGroups.snippet}
                tone='sky'
            />
            <Section
                heading={t.sections.privateFolders.heading}
                description={t.sections.privateFolders.description}
                snippet={t.sections.privateFolders.snippet}
                tone='emerald'
            />
            <Section
                heading={t.sections.parallelRoutes.heading}
                description={t.sections.parallelRoutes.description}
                snippet={t.sections.parallelRoutes.snippet}
                tone='violet'
            />
            <Section
                heading={t.sections.defaultJs.heading}
                description={t.sections.defaultJs.description}
                snippet={t.sections.defaultJs.snippet}
                tone='amber'
            />

            {/* LAB 1 — Dashboard parallel routes */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.dashboard.badge}
                    </span>
                    <h2 className='text-xl font-semibold text-slate-100'>
                        {t.labs.heading}
                    </h2>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.dashboard.description}
                </p>
                <Link
                    href={`${labRoot}/dashboard`}
                    className='inline-flex items-center gap-2 rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20'
                >
                    {t.labs.dashboard.openLabel}
                </Link>
            </section>

            <Section
                heading={t.sections.interceptingRoutes.heading}
                description={t.sections.interceptingRoutes.description}
                snippet={t.sections.interceptingRoutes.snippet}
                tone='cyan'
            />

            {/* LAB 2 — Gallery intercepting routes */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.gallery.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.gallery.description}
                </p>
                <Link
                    href={`${labRoot}/gallery`}
                    className='inline-flex items-center gap-2 rounded-md border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-500/20'
                >
                    {t.labs.gallery.openLabel}
                </Link>
            </section>

            <Section
                heading={t.sections.catchAll.heading}
                description={t.sections.catchAll.description}
                snippet={t.sections.catchAll.snippet}
                tone='fuchsia'
            />
            <Section
                heading={t.sections.useSegment.heading}
                description={t.sections.useSegment.description}
                snippet={t.sections.useSegment.snippet}
                tone='rose'
            />

            {/* LAB 3 — Crumbs catch-all */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.crumbs.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.crumbs.description}
                </p>
                <div className='space-y-2'>
                    {[
                        t.labs.crumbs.example1,
                        t.labs.crumbs.example2,
                        t.labs.crumbs.example3,
                    ].map((path) => (
                        <Link
                            key={path}
                            href={`${labRoot}${path}`}
                            className='inline-flex items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-(--font-mono) text-[12px] text-cyan-200 transition hover:bg-cyan-500/20'
                        >
                            <span>{t.labs.crumbs.tryLabel}</span>
                            <span className='text-cyan-100'>{path}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* §8 Decision table */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.decisionTable.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.decisionTable.intro}
                </p>
                <div className='overflow-x-auto rounded-lg border border-slate-700/60'>
                    <table className='w-full text-left text-sm'>
                        <tbody>
                            {t.decisionTable.rows.map((row, idx) => (
                                <tr
                                    key={row.scenario}
                                    className={
                                        idx % 2 === 0
                                            ? 'bg-slate-900/40'
                                            : 'bg-slate-900/20'
                                    }
                                >
                                    <td className='border-r border-slate-700/60 px-3 py-2 align-top text-slate-300'>
                                        {row.scenario}
                                    </td>
                                    <td className='px-3 py-2 align-top font-(--font-mono) text-[12px] text-sky-200'>
                                        {row.choice}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* DEBUG */}
            <section className='space-y-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.debug.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.debug.description}
                </p>
                <ol className='list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300 marker:text-rose-400'>
                    {t.debug.steps.map((step, idx) => (
                        <li key={idx} className='whitespace-pre-line'>
                            {step}
                        </li>
                    ))}
                </ol>
            </section>
        </article>
    );
}
