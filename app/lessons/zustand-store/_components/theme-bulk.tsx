'use client';
// =============================================================================
// app/lessons/zustand-store/_components/theme-bulk.tsx
// ANTI-PATTERN — selector returns the ENTIRE state object.
// Re-renders on every store mutation because Zustand's Object.is comparison
// finds the new state object is a different reference. Even mutations to
// fields this component never reads (none in Theme, but imagine a future
// `lastChangedAt` field) would re-render it.
// -----------------------------------------------------------------------------
// 🧠 Mental model: write selectors that return the MINIMUM data this consumer
// actually uses. If you need many fields, prefer multiple narrow selectors
// over `s => s` or `s => ({ a, b })` (the second form creates a NEW object on
// every read, so Object.is always returns false → infinite re-renders unless
// you use `useShallow`).
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useThemeStore, type Theme } from './theme-store';

const THEMES: Theme[] = ['dark', 'light', 'amber'];

export default function ThemeBulk({
    bulkLabel,
    bulkNote,
    themeLabel,
    themes,
    renderLabel,
}: {
    bulkLabel: string;
    bulkNote: string;
    themeLabel: string;
    themes: Record<Theme, string>;
    renderLabel: string;
}) {
    // Subscribing to the whole state. Re-renders on every set() call —
    // even if the field we actually use (setTheme) never changes.
    const state = useThemeStore(s => s);
    const renders = useRenderCount();
    return (
        <div className='rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-slate-200'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-rose-300 uppercase'>
                    {bulkLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            <p className='mb-3 text-[11px] font-medium tracking-wide text-slate-400 uppercase'>
                {themeLabel}
            </p>
            <div className='flex flex-wrap gap-2'>
                {THEMES.map(t => (
                    <button
                        key={t}
                        type='button'
                        onClick={() => state.setTheme(t)}
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-rose-400/60 hover:bg-rose-500/10'
                    >
                        {themes[t]}
                    </button>
                ))}
            </div>
            <p className='mt-3 border-t border-rose-500/20 pt-2 text-xs leading-relaxed text-slate-400'>
                {bulkNote}
            </p>
        </div>
    );
}
