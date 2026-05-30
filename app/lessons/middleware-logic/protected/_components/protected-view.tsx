'use client';
// =============================================================================
// app/lessons/middleware-logic/protected/_components/protected-view.tsx
// Client UI for the protected subroute. Reads localised labels via useLang.
// =============================================================================

import Link from 'next/link';
import { useLang } from '../../../_components/lang-provider';
import { content } from '../../_lib/content';

export default function ProtectedView() {
    const lang = useLang();
    const labels = content[lang].labs.protected;

    return (
        <article className='space-y-6'>
            <header className='space-y-2'>
                <span className='inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300'>
                    🔓 nb-demo-pass=1
                </span>
                <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                    {labels.protectedPageHeading}
                </h1>
            </header>

            <p className='max-w-2xl text-base leading-relaxed text-slate-300'>
                {labels.protectedPageBody}
            </p>

            <Link
                href='/lessons/middleware-logic'
                className='inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-slate-100'
            >
                {labels.backLabel}
            </Link>
        </article>
    );
}
