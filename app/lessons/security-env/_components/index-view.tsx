'use client';
// =============================================================================
// app/lessons/security-env/_components/index-view.tsx
// Client orchestrator for Module 5 · Lesson 3 — same shape as the other
// lessons. The four labs are rendered as slot children (each created in
// page.tsx with its `key` to silence the React 19 RSC dev-mode warning).
// =============================================================================

import type { ReactNode } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    envInspector: ReactNode;
    headersInspector: ReactNode;
    cspDemo: ReactNode;
    webhookDemo: ReactNode;
};

export default function IndexView({
    envInspector,
    headersInspector,
    cspDemo,
    webhookDemo,
}: Props) {
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

            {/* §1 Bundle split */}
            <Section
                heading={t.sections.bundleSplit.heading}
                description={t.sections.bundleSplit.description}
                snippet={t.sections.bundleSplit.snippet}
                tone='sky'
            />

            {/* §2 Env loading */}
            <Section
                heading={t.sections.envLoading.heading}
                description={t.sections.envLoading.description}
                snippet={t.sections.envLoading.snippet}
                tone='emerald'
            />

            {/* §3 zod */}
            <Section
                heading={t.sections.zodValidation.heading}
                description={t.sections.zodValidation.description}
                snippet={t.sections.zodValidation.snippet}
                tone='violet'
            />

            {/* LAB 1 — Env inspector */}
            <Lab
                badge={t.labs.env.badge}
                heading={t.labs.heading}
                description={t.labs.env.description}
            >
                {envInspector}
            </Lab>

            {/* §4 server-only */}
            <Section
                heading={t.sections.serverOnly.heading}
                description={t.sections.serverOnly.description}
                snippet={t.sections.serverOnly.snippet}
                tone='amber'
            />

            {/* §5 Static headers */}
            <Section
                heading={t.sections.staticHeaders.heading}
                description={t.sections.staticHeaders.description}
                snippet={t.sections.staticHeaders.snippet}
                tone='cyan'
            />

            {/* §6 CSP nonce */}
            <Section
                heading={t.sections.cspNonce.heading}
                description={t.sections.cspNonce.description}
                snippet={t.sections.cspNonce.snippet}
                tone='fuchsia'
            />

            {/* LAB 2 — Headers inspector */}
            <Lab
                badge={t.labs.headers.badge}
                description={t.labs.headers.description}
            >
                {headersInspector}
            </Lab>

            {/* LAB 3 — CSP demo */}
            <Lab badge={t.labs.csp.badge} description={t.labs.csp.description}>
                {cspDemo}
            </Lab>

            {/* §7 Webhook HMAC */}
            <Section
                heading={t.sections.webhookHmac.heading}
                description={t.sections.webhookHmac.description}
                snippet={t.sections.webhookHmac.snippet}
                tone='rose'
            />

            {/* LAB 4 — Webhook demo */}
            <Lab
                badge={t.labs.webhook.badge}
                description={t.labs.webhook.description}
            >
                {webhookDemo}
            </Lab>

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

// -----------------------------------------------------------------------------
// Reusable section / lab wrappers — module-scope (avoid the inline-component
// anti-pattern that bit us in seo-metadata Lab 1).
// -----------------------------------------------------------------------------

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

function Lab({
    badge,
    heading,
    description,
    children,
}: {
    badge: string;
    heading?: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className='space-y-3'>
            <div className='flex items-center gap-2'>
                <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300'>
                    {badge}
                </span>
                {heading && (
                    <h2 className='text-xl font-semibold text-slate-100'>
                        {heading}
                    </h2>
                )}
            </div>
            <p className='text-sm leading-relaxed text-slate-400'>{description}</p>
            {children}
        </section>
    );
}
