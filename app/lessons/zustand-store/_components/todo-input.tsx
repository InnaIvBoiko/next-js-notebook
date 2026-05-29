'use client';
// =============================================================================
// app/lessons/zustand-store/_components/todo-input.tsx
// WRITER — subscribes only to the `addTodo` action.
// Action references are stable across store updates, so this component
// NEVER re-renders when the list changes. The render badge stays at 1 even
// after adding 100 todos.
// =============================================================================

import { useState } from 'react';
import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useTodoStore } from './todo-store';

export default function TodoInput({
    placeholder,
    addLabel,
    badgeLabel,
    renderLabel,
}: {
    placeholder: string;
    addLabel: string;
    badgeLabel: string;
    renderLabel: string;
}) {
    const addTodo = useTodoStore(s => s.addTodo);
    const renders = useRenderCount();
    // Local form state — it changes on every keystroke, but that doesn't
    // touch the Zustand store. Local UI state belongs in useState, not in
    // the global store.
    const [draft, setDraft] = useState('');

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                const text = draft.trim();
                if (text.length === 0) return;
                addTodo(text);
                setDraft('');
            }}
            className='space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'
        >
            <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {badgeLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            <div className='flex gap-2'>
                <input
                    type='text'
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder={placeholder}
                    className='flex-1 rounded-md border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none'
                />
                <button
                    type='submit'
                    className='shrink-0 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50'
                    disabled={draft.trim().length === 0}
                >
                    {addLabel}
                </button>
            </div>
        </form>
    );
}
