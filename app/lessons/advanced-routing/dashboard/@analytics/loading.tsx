// =============================================================================
// app/lessons/advanced-routing/dashboard/@analytics/loading.tsx
// Independent Suspense boundary for the @analytics slot. While the slot's
// async render is pending, this skeleton is streamed to the client.
// -----------------------------------------------------------------------------
// The PARENT layout doesn't know which slot is still loading — each has its
// own boundary. That's why you see the skeletons resolve INDEPENDENTLY in
// DevTools → Network with throttling.
// =============================================================================

export default function AnalyticsLoading() {
    return (
        <div className='space-y-3' aria-busy='true' aria-live='polite'>
            <div className='flex items-center justify-between'>
                <div className='h-5 w-28 animate-pulse rounded-full bg-violet-500/20' />
                <div className='h-3 w-16 animate-pulse rounded bg-slate-800/60' />
            </div>
            <div className='h-4 w-24 animate-pulse rounded bg-slate-800/60' />
            <div className='space-y-2'>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className='flex items-center justify-between rounded bg-slate-950/40 px-3 py-2'
                    >
                        <div className='h-3 w-12 animate-pulse rounded bg-slate-800/60' />
                        <div className='h-3 w-20 animate-pulse rounded bg-slate-800/60' />
                    </div>
                ))}
            </div>
        </div>
    );
}
