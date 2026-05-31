// =============================================================================
// app/lessons/advanced-routing/dashboard/page.tsx
// The `children` slot of the dashboard layout — the "header" of the demo.
// Reads the lesson language from the `nb-lang` cookie via getLessonLang().
// =============================================================================

import { content } from '../_lib/content';
import { getLessonLang } from '../_lib/lang';

export default async function DashboardPage() {
    const lang = await getLessonLang();
    const t = content[lang].subroutes.dashboard;

    return (
        <header className='space-y-2'>
            <span className='inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300'>
                {t.badge}
            </span>
            <h1 className='text-2xl font-bold text-white'>{t.title}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-400 whitespace-pre-line'>
                {t.description}
            </p>
        </header>
    );
}
