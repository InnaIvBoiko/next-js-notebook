// =============================================================================
// app/lessons/advanced-routing/dashboard/layout.tsx
// PARALLEL ROUTES layout — receives `children`, `analytics`, `team` slots.
// -----------------------------------------------------------------------------
// 🧠 THE SLOT PROPS
// Sibling folders prefixed with `@` become named slot props on this layout:
//   • @analytics/page.tsx → `analytics`
//   • @team/page.tsx      → `team`
// `children` is the implicit slot fed by `page.tsx`.
//
// 🧠 INDEPENDENT STREAMING
// Each slot has its own `loading.tsx` Suspense boundary. The runtime renders
// the layout shell + skeletons IMMEDIATELY, then streams the slot bodies as
// they resolve. With DevTools → Network → throttle Slow 3G, you can watch
// the two skeletons get replaced at different times.
//
// 🧠 default.tsx
// Each slot also has a `default.tsx`. On HARD navigation to a child route
// that doesn't match a slot, Next renders the slot's default. Without one,
// the user gets a 404 on refresh.
//
// 🧠 i18n
// Layouts are Server Components → we read `nb-lang` from the cookie via the
// shared `getLessonLang()` helper. The same pattern is used by every sub-route
// page in this lesson.
// =============================================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { content } from '../_lib/content';
import { getLessonLang } from '../_lib/lang';

type Props = {
    children: ReactNode;
    analytics: ReactNode;
    team: ReactNode;
};

export default async function DashboardLayout({
    children,
    analytics,
    team,
}: Props) {
    const lang = await getLessonLang();
    const t = content[lang].subroutes;

    return (
        <div className='space-y-6'>
            <Link
                href='/lessons/advanced-routing'
                className='inline-block text-sm text-sky-300 hover:text-sky-200'
            >
                {t.backToLesson}
            </Link>

            {/* children — `page.tsx` of this folder, full width */}
            <div>{children}</div>

            {/* The two parallel slots — laid out side-by-side on desktop */}
            <div className='grid gap-4 lg:grid-cols-2'>
                <section className='rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
                    {analytics}
                </section>
                <section className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
                    {team}
                </section>
            </div>
        </div>
    );
}
