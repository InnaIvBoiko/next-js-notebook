'use client';
// Parameterized view for the sub-routes /a and /b.
// The `which` prop selects which dictionary entry to render and which target
// route to link to as "the other one". Reads lang from the layout Context,
// so the language stays consistent with the main lesson page.

import Link from 'next/link';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

// Visual accent per sub-route, kept here as a tiny config.
const VARIANTS = {
    a: {
        accentBorder: 'border-violet-500/30',
        accentBg: 'bg-violet-500/10',
        accentText: 'text-violet-300',
        otherHref: '/lessons/routing-basics/b',
    },
    b: {
        accentBorder: 'border-pink-500/30',
        accentBg: 'bg-pink-500/10',
        accentText: 'text-pink-300',
        otherHref: '/lessons/routing-basics/a',
    },
} as const;

export default function SubRouteView({ which }: { which: 'a' | 'b' }) {
    const { lang } = useLessonLang();
    const t = content[lang].subRoutes[which];
    const v = VARIANTS[which];

    return (
        <div className='space-y-4'>
            <span
                className={`inline-block rounded-full border ${v.accentBorder} ${v.accentBg} px-3 py-1 text-xs font-medium ${v.accentText}`}
            >
                {t.badge}
            </span>
            <h1 className='text-2xl font-bold text-white'>{t.url}</h1>
            <p className='text-sm text-slate-400'>{t.description}</p>
            <div className='flex flex-wrap gap-3'>
                <Link
                    href='/lessons/routing-basics'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    {t.backToLesson}
                </Link>
                <Link
                    href={v.otherHref}
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    {t.goToOther}
                </Link>
            </div>
        </div>
    );
}
