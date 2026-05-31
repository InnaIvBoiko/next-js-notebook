'use client';
// =============================================================================
// app/lessons/deploy-ready/_components/index-view.tsx
// Client orchestrator — theory sections + 3 lab slots.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// Same shape as security-env/index-view.tsx: this component is a CLIENT
// island (because it reads useLang() context), but the 3 labs are passed
// in AS SLOTS. The build-marker viewer + preflight checklist are Server
// Components rendered by page.tsx, then injected here; the runtime-probe
// card is a Client island that does its own cross-origin fetch.
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

const toneMap = {
    sky: 'border-sky-500/20 bg-sky-500/5 text-sky-100',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100',
    violet: 'border-violet-500/20 bg-violet-500/5 text-violet-100',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-100',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100',
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

export default function IndexView({
    buildViewer,
    runtimeProbe,
    preflight,
}: {
    buildViewer: ReactNode;
    runtimeProbe: ReactNode;
    preflight: ReactNode;
}) {
    const lang = useLang();
    const t = content[lang];

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

            {/* Live deploy banner */}
            <section className='rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
                <h2 className='text-base font-semibold text-violet-200'>
                    {t.liveDeploy.heading}
                </h2>
                <p className='mt-1 text-sm leading-relaxed text-slate-400'>
                    {t.liveDeploy.description}
                </p>
                <a
                    href={t.liveDeploy.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-3 inline-flex items-center gap-2 rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20'
                >
                    {t.liveDeploy.openLabel}
                </a>
            </section>

            {/* THEORY */}
            <Section
                heading={t.sections.buildAnatomy.heading}
                description={t.sections.buildAnatomy.description}
                snippet={t.sections.buildAnatomy.snippet}
                tone='sky'
            />

            {/* LAB 1 */}
            {buildViewer}

            <Section
                heading={t.sections.runtime.heading}
                description={t.sections.runtime.description}
                snippet={t.sections.runtime.snippet}
                tone='emerald'
            />

            {/* LAB 2 */}
            {runtimeProbe}

            <Section
                heading={t.sections.outputModes.heading}
                description={t.sections.outputModes.description}
                snippet={t.sections.outputModes.snippet}
                tone='violet'
            />
            <Section
                heading={t.sections.ciPipeline.heading}
                description={t.sections.ciPipeline.description}
                snippet={t.sections.ciPipeline.snippet}
                tone='cyan'
            />

            {/* §5 Decision table */}
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

            {/* LAB 3 */}
            {preflight}

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
