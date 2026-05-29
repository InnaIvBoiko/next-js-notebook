// =============================================================================
// app/lessons/server-fetching/dynamic/loading.tsx
// Segment-scoped Suspense fallback. Required since cacheComponents was
// enabled in Module 2 Lesson 2.
// =============================================================================

export default function DynamicLoading() {
    return (
        <section className='space-y-4'>
            <div className='flex items-center gap-3'>
                <span
                    className='inline-block h-3 w-3 animate-pulse rounded-full bg-amber-400'
                    aria-hidden
                />
                <p className='text-sm font-medium text-slate-200'>
                    Reading cookies and headers…
                </p>
            </div>
            <div className='space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'>
                <div className='h-3 w-1/3 animate-pulse rounded bg-slate-800' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-slate-800' />
            </div>
        </section>
    );
}
