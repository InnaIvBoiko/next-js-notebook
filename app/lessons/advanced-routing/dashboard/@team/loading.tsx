// =============================================================================
// app/lessons/advanced-routing/dashboard/@team/loading.tsx
// Skeleton for the @team slot — INDEPENDENT from @analytics's loading.tsx.
// =============================================================================

export default function TeamLoading() {
    return (
        <div className='space-y-3' aria-busy='true' aria-live='polite'>
            <div className='flex items-center justify-between'>
                <div className='h-5 w-20 animate-pulse rounded-full bg-emerald-500/20' />
                <div className='h-3 w-16 animate-pulse rounded bg-slate-800/60' />
            </div>
            <div className='h-4 w-36 animate-pulse rounded bg-slate-800/60' />
            <div className='space-y-2'>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className='flex items-center justify-between rounded bg-slate-950/40 px-3 py-2'
                    >
                        <div className='space-y-1'>
                            <div className='h-3 w-16 animate-pulse rounded bg-slate-800/60' />
                            <div className='h-2 w-12 animate-pulse rounded bg-slate-800/40' />
                        </div>
                        <div className='h-3 w-24 animate-pulse rounded bg-slate-800/60' />
                    </div>
                ))}
            </div>
        </div>
    );
}
