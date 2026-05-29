'use client';
// =============================================================================
// app/lessons/context-provider/_components/theme-combined.tsx
// ANTI-PATTERN COMPARISON — uses the convenience hook `useTheme()` which reads
// BOTH contexts. The component intentionally only NEEDS setTheme to do its job
// (the same buttons as ThemeControls), but the StateContext subscription drags
// it into every theme change. Watch this render counter climb in lockstep with
// ThemePreview's, even though we never read `theme` for rendering.
// -----------------------------------------------------------------------------
// 🧠 The fix is not to memoise the return of useTheme(): the re-render is
// caused by the subscription itself, not by the object reference. The fix is
// to call the granular hook (useThemeSetter) — see ThemeControls.
// =============================================================================

import { RenderBadge, useRenderCount } from './render-counter';
import { useTheme, type Theme } from './theme-provider';

const THEMES: Theme[] = ['dark', 'light', 'amber'];

export default function ThemeCombined({
    combinedLabel,
    combinedNote,
    themeLabel,
    themes,
    renderLabel,
}: {
    combinedLabel: string;
    combinedNote: string;
    themeLabel: string;
    themes: Record<Theme, string>;
    renderLabel: string;
}) {
    // Same job as ThemeControls (we just want to set the theme), but via the
    // "combined" convenience hook. We don't read `theme` for rendering, yet
    // useTheme() internally calls useThemeState() which subscribes us to the
    // StateContext — that subscription alone is enough to re-render us on
    // every theme change. The lesson: granular hooks beat convenience hooks
    // when consumers only need part of the value.
    const { setTheme } = useTheme();
    const renders = useRenderCount();
    return (
        <div className='rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-slate-200'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-rose-300 uppercase'>
                    {combinedLabel}
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
                        onClick={() => setTheme(t)}
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-rose-400/60 hover:bg-rose-500/10'
                    >
                        {themes[t]}
                    </button>
                ))}
            </div>
            <p className='mt-3 border-t border-rose-500/20 pt-2 text-xs leading-relaxed text-slate-400'>
                {combinedNote}
            </p>
        </div>
    );
}
