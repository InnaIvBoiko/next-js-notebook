// =============================================================================
// app/lessons/loading-and-errors/slow/loading.tsx
// SEGMENT-SCOPED Suspense fallback for /lessons/loading-and-errors/slow.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// Placing this file next to page.tsx makes Next AUTOMATICALLY wrap the page
// (and any child layouts) in <Suspense fallback={<Loading/>}>. The moment a
// user navigates to /slow:
//
//   1. The fallback below is shown INSTANTLY.
//   2. The server renders the slow page.tsx in the background.
//   3. Next swaps the page in as soon as it is ready.
//
// Critical: this file is a child of the lesson layout. The layout chrome
// (LangBar above, /lessons "layout clicks" pill higher up) is NOT replaced.
// Only the page slot becomes the skeleton.
//
// By convention this is a Server Component (no 'use client'). It receives NO
// props — loading UI is parameterless.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md
// =============================================================================

import { content } from '../_lib/content';

export default function SlowLoading() {
    // We CANNOT call useLessonLang() here — this is a Server Component and
    // hooks are client-only. We fall back to English copy; the persistent
    // <LangBar> in the layout above still shows the user's actual choice.
    const t = content.en.loadingFallback;
    return (
        <section className='space-y-4'>
            <div className='flex items-center gap-3'>
                <span
                    className='inline-block h-3 w-3 animate-pulse rounded-full bg-sky-400'
                    aria-hidden
                />
                <p className='text-sm font-medium text-slate-200'>{t.title}</p>
            </div>

            {/* Skeleton block — mimics the shape of the real payload below. */}
            <div className='space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'>
                <div className='h-3 w-1/3 animate-pulse rounded bg-slate-800' />
                <div className='h-3 w-2/3 animate-pulse rounded bg-slate-800' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-slate-800' />
            </div>

            <p className='text-xs text-slate-500'>{t.hint}</p>
        </section>
    );
}
