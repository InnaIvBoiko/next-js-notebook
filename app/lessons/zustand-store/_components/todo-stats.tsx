'use client';
// =============================================================================
// app/lessons/zustand-store/_components/todo-stats.tsx
// DERIVED — computes counts INSIDE the selector. Zustand compares results
// with Object.is, so a selector returning a primitive (number) only triggers
// a re-render when the number actually changes — even though `todos` is a
// new array reference after every action.
// -----------------------------------------------------------------------------
// 🧠 Counter-intuitive but important: this component re-renders when the
// _derived_ count changes (e.g. after toggle), but NOT when an unrelated
// todo's `text` is edited (would change the array reference but not the
// counts). For Theme it's just one field; for lists it's a big optimisation.
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useTodoStore } from './todo-store';

export default function TodoStats({
    statsLabel,
    totalLabel,
    doneLabel,
    pendingLabel,
    renderLabel,
}: {
    statsLabel: string;
    totalLabel: string;
    doneLabel: string;
    pendingLabel: string;
    renderLabel: string;
}) {
    // Three narrow selectors, one per derived value. Each subscribes
    // independently — changing only one count re-renders this component once,
    // not three times. (React batches the updates from the same set() call.)
    const total = useTodoStore(s => s.todos.length);
    const done = useTodoStore(s => s.todos.filter(t => t.done).length);
    const pending = total - done;
    const renders = useRenderCount();

    return (
        <div className='rounded-lg border border-violet-500/30 bg-violet-500/5 p-4'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-violet-300 uppercase'>
                    {statsLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            <dl className='grid grid-cols-3 gap-3 text-center'>
                <div>
                    <dt className='text-[10px] tracking-wide text-slate-500 uppercase'>
                        {totalLabel}
                    </dt>
                    <dd className='mt-1 font-mono text-2xl font-semibold text-slate-100'>
                        {total}
                    </dd>
                </div>
                <div>
                    <dt className='text-[10px] tracking-wide text-slate-500 uppercase'>
                        {pendingLabel}
                    </dt>
                    <dd className='mt-1 font-mono text-2xl font-semibold text-amber-300'>
                        {pending}
                    </dd>
                </div>
                <div>
                    <dt className='text-[10px] tracking-wide text-slate-500 uppercase'>
                        {doneLabel}
                    </dt>
                    <dd className='mt-1 font-mono text-2xl font-semibold text-emerald-300'>
                        {done}
                    </dd>
                </div>
            </dl>
        </div>
    );
}
