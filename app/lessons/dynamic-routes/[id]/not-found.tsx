// =============================================================================
// app/lessons/dynamic-routes/[id]/not-found.tsx
// SEGMENT-SCOPED 404 UI for /lessons/dynamic-routes/[id].
// -----------------------------------------------------------------------------
// 🧠 When the page above calls notFound(), React unwinds and Next looks for
// the nearest not-found.tsx in the segment tree. Placed RIGHT HERE, this file
// catches any invalid [id]. Placed one level up (in /dynamic-routes/), it
// would also catch missing index pages of this subtree — different semantics.
//
// Importantly:
//   • This page is still wrapped by the lesson layout (LangBar persists).
//   • The HTTP status code is 404 (Open DevTools → Network → see status).
//   • This is a Server Component by default; no interactivity is needed.
//
// We CANNOT use the lesson's Context here directly (this file would need to
// become a Client component for that). So we render English copy as a sensible
// default. The persistent <LangBar> in the layout still works — switching
// language and navigating back to the list will respect the user's choice.
// =============================================================================

import Link from 'next/link';
import { content } from '../_lib/content';

export default function DynamicRouteNotFound() {
    const t = content.en.notFoundPage;
    return (
        <div className='space-y-5'>
            <span className='inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300'>
                {t.badge}
            </span>
            <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                {t.title}
            </h1>
            <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                {t.description}
            </p>
            <Link
                href='/lessons/dynamic-routes'
                className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
            >
                {t.backToList}
            </Link>
        </div>
    );
}
