// =============================================================================
// app/lessons/server-fetching/parallel/loading.tsx
// Segment-scoped Suspense fallback. Required since cacheComponents was
// enabled in Module 2 Lesson 2.
// =============================================================================

export default function ParallelLoading() {
    return (
        <section className='space-y-4'>
            <div className='flex items-center gap-3'>
                <span
                    className='inline-block h-3 w-3 animate-pulse rounded-full bg-violet-400'
                    aria-hidden
                />
                <p className='text-sm font-medium text-slate-200'>
                    Running sequential + parallel benchmarks…
                </p>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
                {[0, 1].map(i => (
                    <div
                        key={i}
                        className='space-y-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4'
                    >
                        <div className='h-3 w-1/3 animate-pulse rounded bg-slate-800' />
                        <div className='h-3 w-2/3 animate-pulse rounded bg-slate-800' />
                        <div className='h-3 w-1/2 animate-pulse rounded bg-slate-800' />
                    </div>
                ))}
            </div>
        </section>
    );
}
