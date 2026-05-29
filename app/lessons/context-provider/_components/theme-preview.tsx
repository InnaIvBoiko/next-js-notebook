'use client';
// =============================================================================
// app/lessons/context-provider/_components/theme-preview.tsx
// READER — subscribes to ThemeStateContext only.
// Re-renders on every theme change (as expected). The card visually adopts
// the theme via Tailwind classes, so the change is unmissable.
// =============================================================================

import { RenderBadge, useRenderCount } from './render-counter';
import { useThemeState, type Theme } from './theme-provider';

const THEME_STYLE: Record<Theme, string> = {
    dark: 'border-slate-700/60 bg-slate-900/70 text-slate-100',
    light: 'border-slate-300 bg-slate-100 text-slate-900',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-100',
};

export default function ThemePreview({
    readerLabel,
    readerNote,
    body,
    renderLabel,
}: {
    readerLabel: string;
    readerNote: string;
    body: string;
    renderLabel: string;
}) {
    const theme = useThemeState();
    const renders = useRenderCount();
    return (
        <div
            className={`rounded-lg border p-4 transition-colors ${THEME_STYLE[theme]}`}
        >
            <div className='mb-2 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide uppercase opacity-70'>
                    {readerLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            <p className='text-sm leading-relaxed'>{body}</p>
            <p className='mt-3 border-t border-current/15 pt-2 text-xs leading-relaxed opacity-75'>
                {readerNote}
            </p>
        </div>
    );
}
