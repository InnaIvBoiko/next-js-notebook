'use client';
// =============================================================================
// app/lessons/zustand-store/_components/theme-controls.tsx
// WRITER — subscribes ONLY to the `setTheme` action via `s => s.setTheme`.
// Zustand keeps action references stable across renders (the function is
// defined once in the store initialiser and never recreated), so this
// selector returns the same value forever → this component NEVER re-renders
// after mount. The render counter stays at 1 even as you click buttons.
// -----------------------------------------------------------------------------
// 🔑 Same outcome as the split-context ThemeSetterContext from
// /lessons/context-provider, but achieved WITHOUT splitting anything. The
// granularity lives in the selector, not in the provider topology.
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useThemeStore, type Theme } from './theme-store';

const THEMES: Theme[] = ['dark', 'light', 'amber'];

const SWATCH: Record<Theme, string> = {
    dark: 'bg-slate-700 border-slate-500',
    light: 'bg-slate-100 border-slate-300',
    amber: 'bg-amber-400 border-amber-200',
};

export default function ThemeControls({
    writerLabel,
    writerNote,
    themeLabel,
    themes,
    renderLabel,
}: {
    writerLabel: string;
    writerNote: string;
    themeLabel: string;
    themes: Record<Theme, string>;
    renderLabel: string;
}) {
    const setTheme = useThemeStore(s => s.setTheme);
    const renders = useRenderCount();
    return (
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-slate-200'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {writerLabel}
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
                        className='group flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/10'
                    >
                        <span
                            className={`inline-block h-3 w-3 rounded-full border ${SWATCH[t]}`}
                            aria-hidden
                        />
                        {themes[t]}
                    </button>
                ))}
            </div>
            <p className='mt-3 border-t border-emerald-500/20 pt-2 text-xs leading-relaxed text-slate-400'>
                {writerNote}
            </p>
        </div>
    );
}
