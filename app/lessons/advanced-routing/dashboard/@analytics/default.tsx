// =============================================================================
// app/lessons/advanced-routing/dashboard/@analytics/default.tsx
// Fallback for the @analytics slot on HARD navigation to a child route that
// the slot can't match. Without this file, refreshing such a URL → 404.
// -----------------------------------------------------------------------------
// In this demo we never navigate to a sub-route under @analytics, so default
// would only render in an edge case. Keeping it explicit teaches the
// convention and protects future you from a confusing 404.
// =============================================================================

export default function AnalyticsDefault() {
    return (
        <div className='space-y-2'>
            <span className='inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                @analytics slot
            </span>
            <p className='text-sm text-slate-500 italic'>
                No analytics view selected. This is{' '}
                <code>@analytics/default.tsx</code> — the mandatory fallback
                that prevents a 404 on hard navigation.
            </p>
        </div>
    );
}
