'use client';
// =============================================================================
// app/lessons/zustand-store/_components/todo-list.tsx
// READER + WRITER — subscribes to `state.todos` AND uses toggle/remove
// actions. Re-renders whenever the list changes (add, toggle, remove, clear).
// =============================================================================

import { RenderBadge, useRenderCount } from '../../_components/render-counter';
import { useTodoStore } from './todo-store';

export default function TodoList({
    listLabel,
    emptyLabel,
    renderLabel,
}: {
    listLabel: string;
    emptyLabel: string;
    renderLabel: string;
}) {
    // Narrow selector — the list array reference changes only when an action
    // creates a new array (add, toggle, remove, clearCompleted).
    const todos = useTodoStore(s => s.todos);
    const toggleTodo = useTodoStore(s => s.toggleTodo);
    const removeTodo = useTodoStore(s => s.removeTodo);
    const renders = useRenderCount();

    return (
        <div className='rounded-lg border border-sky-500/30 bg-sky-500/5 p-4'>
            <div className='mb-3 flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-semibold tracking-wide text-sky-300 uppercase'>
                    {listLabel}
                </span>
                <RenderBadge label={renderLabel} count={renders} />
            </div>
            {todos.length === 0 ? (
                <p className='text-center text-xs text-slate-500 italic'>
                    {emptyLabel}
                </p>
            ) : (
                <ul className='space-y-1.5'>
                    {todos.map(todo => (
                        <li
                            key={todo.id}
                            className='flex items-center gap-2 rounded-md border border-slate-700/40 bg-slate-900/40 px-3 py-1.5'
                        >
                            <input
                                type='checkbox'
                                checked={todo.done}
                                onChange={() => toggleTodo(todo.id)}
                                className='size-4 cursor-pointer accent-sky-500'
                            />
                            <span
                                className={`flex-1 text-sm ${
                                    todo.done
                                        ? 'text-slate-500 line-through'
                                        : 'text-slate-200'
                                }`}
                            >
                                {todo.text}
                            </span>
                            <button
                                type='button'
                                onClick={() => removeTodo(todo.id)}
                                className='shrink-0 rounded px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300'
                                aria-label='remove'
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
