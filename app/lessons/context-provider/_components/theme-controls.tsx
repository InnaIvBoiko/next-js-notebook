'use client';
// =============================================================================
// app/lessons/context-provider/_components/theme-controls.tsx
// SPLIT WRITER — subscribes ONLY to ThemeSetterContext (via useThemeSetter).
// The render counter on this card should STAY PUT when you change theme,
// because this component never reads the theme value. That is the win of
// splitting state and setter into two contexts.
// =============================================================================

import { RenderBadge, useRenderCount } from './render-counter';
import { useThemeSetter, type Theme } from './theme-provider';

const THEMES: Theme[] = ['dark', 'light', 'amber'];

const SWATCH: Record<Theme, string> = {
    dark: 'bg-slate-700 border-slate-500',
    light: 'bg-slate-100 border-slate-300',
    amber: 'bg-amber-400 border-amber-200',
};

export default function ThemeControls({
    setterLabel,
    setterNote,
    themeLabel,
    themes,
    renderLabel,
}: {
    setterLabel: string;
    setterNote: string;
    themeLabel: string;
    themes: Record<Theme, string>;
    renderLabel: string;
}) {
    const setTheme = useThemeSetter();
    const renders = useRenderCount();
    return (
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-slate-200'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {setterLabel}
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
                {setterNote}
            </p>
        </div>
    );
}
