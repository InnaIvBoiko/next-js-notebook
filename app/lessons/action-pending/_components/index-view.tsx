'use client';

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const DEMO_ORDER = ['actionState', 'formStatus', 'optimistic'] as const;
type DemoKey = (typeof DEMO_ORDER)[number];

const DEMO_SLUG: Record<DemoKey, string> = {
    actionState: 'use-action-state',
    formStatus: 'use-form-status',
    optimistic: 'use-optimistic',
};

const DEMO_ACCENT: Record<DemoKey, string> = {
    actionState:
        'border-sky-500/30 bg-sky-500/5 hover:border-sky-400/50 hover:bg-sky-500/10',
    formStatus:
        'border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50 hover:bg-violet-500/10',
    optimistic:
        'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50 hover:bg-emerald-500/10',
};

const DEMO_EMOJI: Record<DemoKey, string> = {
    actionState: '🪪',
    formStatus: '⏳',
    optimistic: '⚡',
};

export default function IndexView() {
    const { lang } = useLessonLang();
    const t = content[lang].index;

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

            {/* §1 — useActionState */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.useActionState.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.useActionState.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 font-mono text-[11px] leading-relaxed text-sky-100'>
                    {t.sections.useActionState.snippet}
                </pre>
            </section>

            {/* §2 — useFormStatus */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.useFormStatus.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.useFormStatus.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 font-mono text-[11px] leading-relaxed text-violet-100'>
                    {t.sections.useFormStatus.snippet}
                </pre>
            </section>

            {/* §3 — useOptimistic */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.useOptimistic.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.useOptimistic.description}
                </p>
                <pre className='overflow-x-auto rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 font-mono text-[11px] leading-relaxed text-emerald-100'>
                    {t.sections.useOptimistic.snippet}
                </pre>
            </section>

            {/* §4 — Which one to use */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.sections.whichOne.heading}
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    {t.sections.whichOne.description}
                </p>
                <ul className='space-y-2 text-sm leading-relaxed text-slate-300'>
                    <li className='rounded-md border border-sky-500/20 bg-sky-500/5 p-3'>
                        {t.sections.whichOne.bulletActionState}
                    </li>
                    <li className='rounded-md border border-violet-500/20 bg-violet-500/5 p-3'>
                        {t.sections.whichOne.bulletFormStatus}
                    </li>
                    <li className='rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3'>
                        {t.sections.whichOne.bulletOptimistic}
                    </li>
                </ul>
            </section>

            {/* DEMOS */}
            <section className='space-y-4'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    {t.demosHeading}
                </h2>
                <ul className='grid gap-3 sm:grid-cols-3'>
                    {DEMO_ORDER.map(key => {
                        const demo = t.demos[key];
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
                                            /{DEMO_SLUG[key]}
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
