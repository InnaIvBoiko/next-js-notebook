'use client';
// =============================================================================
// app/lessons/seo-metadata/_components/index-view.tsx
// Client orchestrator for Module 5 · Lesson 2 — same shape as the other
// lessons: header, theory sections (with code snippets), decision table,
// labs (passed as ReactNode slots from the Server page), and debug lab.
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    metaInspector: ReactNode;
    postsDemo: ReactNode;
    routesDemo: ReactNode;
    // The Course JSON-LD `<script>` is rendered HERE rather than as a sibling
    // of <IndexView> in the page's return. Returning a single root element
    // from a Server Component that streams slot props to a Client Component
    // sidesteps a React 19 dev-mode "missing key" false positive that fires
    // when the parent returns a Fragment + multiple children + nested slot
    // props (the RSC Flight serialiser ends up walking the slot array and
    // asks for keys it shouldn't need).
    jsonLd: ReactNode;
};

export default function IndexView({
    metaInspector,
    postsDemo,
    routesDemo,
    jsonLd,
}: Props) {
    const lang = useLang();
    const t = content[lang];

    return (
        <article className='space-y-10'>
            {jsonLd}
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

            {/* §1 — Pipeline */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.pipeline.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.pipeline.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.pipeline.snippet}
                </pre>
            </section>

            {/* §2 — Static metadata */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.staticMetadata.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.staticMetadata.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.staticMetadata.snippet}
                </pre>
            </section>

            {/* §3 — generateMetadata */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.generateMetadata.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.generateMetadata.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.generateMetadata.snippet}
                </pre>
            </section>

            {/* §4 — OG image */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.ogImage.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.ogImage.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-amber-100'>
                    {t.sections.ogImage.snippet}
                </pre>
            </section>

            {/* §5 — Sitemap */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.sitemap.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.sitemap.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-cyan-100'>
                    {t.sections.sitemap.snippet}
                </pre>
            </section>

            {/* §6 — Robots */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.robots.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.robots.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.robots.snippet}
                </pre>
            </section>

            {/* §7 — JSON-LD */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.jsonLd.heading}
                </h2>
                <p className='text-sm leading-relaxed whitespace-pre-line text-slate-400'>
                    {t.sections.jsonLd.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 font-(--font-mono) text-[11px] leading-relaxed text-fuchsia-100'>
                    {t.sections.jsonLd.snippet}
                </pre>
            </section>

            {/* LAB 1 — Meta inspector */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.metaInspector.badge}
                    </span>
                    <h2 className='text-xl font-semibold text-slate-100'>
                        {t.labs.heading}
                    </h2>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.metaInspector.description}
                </p>
                {metaInspector}
            </section>

            {/* LAB 2 — Posts (dynamic [slug]) */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.posts.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.posts.description}
                </p>
                {postsDemo}
            </section>

            {/* LAB 3 — Routes (file conventions) */}
            <section className='space-y-3'>
                <div className='flex items-center gap-2'>
                    <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                        {t.labs.routes.badge}
                    </span>
                </div>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.labs.routes.description}
                </p>
                {routesDemo}
            </section>

            {/* §8 — Decision table */}
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

            {/* DEBUG LAB */}
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
