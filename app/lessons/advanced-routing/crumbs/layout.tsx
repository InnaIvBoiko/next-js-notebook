// =============================================================================
// app/lessons/advanced-routing/crumbs/layout.tsx
// Wraps the catch-all crumbs page with a localised "back to lesson" link.
// =============================================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { content } from '../_lib/content';
import { getLessonLang } from '../_lib/lang';

export default async function CrumbsLayout({ children }: { children: ReactNode }) {
    const lang = await getLessonLang();
    const t = content[lang].subroutes;

    return (
        <div className='space-y-4'>
            <Link
                href='/lessons/advanced-routing'
                className='inline-block text-sm text-sky-300 hover:text-sky-200'
            >
                {t.backToLesson}
            </Link>
            {children}
        </div>
    );
}
