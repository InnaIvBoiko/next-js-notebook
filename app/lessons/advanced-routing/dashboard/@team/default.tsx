// =============================================================================
// app/lessons/advanced-routing/dashboard/@team/default.tsx
// Fallback for the @team slot. Mirror of @analytics/default.tsx.
// =============================================================================

export default function TeamDefault() {
    return (
        <div className='space-y-2'>
            <span className='inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase'>
                @team slot
            </span>
            <p className='text-sm text-slate-500 italic'>
                No team view selected. This is{' '}
                <code>@team/default.tsx</code> — keeps refresh from 404-ing.
            </p>
        </div>
    );
}
