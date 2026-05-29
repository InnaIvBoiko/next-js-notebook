// =============================================================================
// app/lessons/server-fetching/default/loading.tsx
// Segment-scoped Suspense fallback. Required (since enabling cacheComponents
// in Module 2 Lesson 2) because the page reads non-deterministic data
// (Date.now() inside fetchPosts) and must be wrapped in <Suspense> for the
// static shell to prerender. See Lesson 4 for the loading.tsx convention.
// =============================================================================

export default function DefaultLoading() {
    return (
        <section className='space-y-4'>
            <div className='flex items-center gap-3'>
                <span
                    className='inline-block h-3 w-3 animate-pulse rounded-full bg-sky-400'
                    aria-hidden
                />
                <p className='text-sm font-medium text-slate-200'>
                    Fetching posts…
                </p>
            </div>
            <div className='space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'>
                <div className='h-3 w-1/3 animate-pulse rounded bg-slate-800' />
                <div className='h-3 w-2/3 animate-pulse rounded bg-slate-800' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-slate-800' />
            </div>
        </section>
    );
}
