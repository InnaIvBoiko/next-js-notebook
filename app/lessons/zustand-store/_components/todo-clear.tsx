'use client';
// =============================================================================
// app/lessons/zustand-store/_components/todo-clear.tsx
// WRITER — subscribes only to `clearCompleted`. Action references are stable,
// so this component never re-renders even after thousands of todo mutations.
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useTodoStore } from './todo-store';

export default function TodoClear({
    clearLabel,
    badgeLabel,
    renderLabel,
}: {
    clearLabel: string;
    badgeLabel: string;
    renderLabel: string;
}) {
    const clearCompleted = useTodoStore(s => s.clearCompleted);
    const renders = useRenderCount();
    return (
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {badgeLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            <button
                type='button'
                onClick={() => clearCompleted()}
                className='w-full rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/20'
            >
                {clearLabel}
            </button>
        </div>
    );
}
