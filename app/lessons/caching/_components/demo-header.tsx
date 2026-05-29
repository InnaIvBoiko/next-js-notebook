'use client';
// Reusable header for the three demo pages.

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

type DemoKey = 'baseline' | 'cached' | 'reactCache';

const ACCENT: Record<DemoKey, string> = {
    baseline: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    cached: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    reactCache: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
};

export default function DemoHeader({ which }: { which: DemoKey }) {
    const { lang } = useLessonLang();
    const t = content[lang].demos[which];

    return (
        <header className='space-y-4'>
            <div className='flex items-center justify-between'>
                <Link
                    href='/lessons/caching'
                    className='inline-flex items-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/50 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100'
                >
                    {t.backToIndex}
                </Link>
                <span
                    className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium ${ACCENT[which]}`}
                >
                    {t.badge}
                </span>
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                {t.title}
            </h1>
            <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                {t.description}
            </p>
        </header>
    );
}
