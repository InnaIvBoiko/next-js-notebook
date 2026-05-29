'use client';
// =============================================================================
// app/lessons/zustand-store/_components/theme-preview.tsx
// READER — subscribes ONLY to `state.theme` via a narrow selector.
// Re-renders on every theme change (because that slice changed) but NOT when
// other slices of the store change. Direct parallel to ThemePreview in
// /lessons/context-provider, which subscribed to ThemeStateContext.
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useThemeStore, type Theme } from './theme-store';

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
    // 🔑 The selector `s => s.theme` is the heart of Zustand's perf model.
    // The hook subscribes this component to the slice the selector returns.
    // When `set({ theme: 'light' })` runs, Zustand compares the new selector
    // result with the previous one via Object.is — only re-renders this
    // component if they differ.
    const theme = useThemeStore(s => s.theme);
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
