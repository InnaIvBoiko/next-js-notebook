'use client';
// =============================================================================
// app/lessons/zustand-store/_components/todo-store.tsx
// FACTORY + PROVIDER Zustand store — the App Router production pattern.
// -----------------------------------------------------------------------------
// 🧠 WHY NOT MODULE-SCOPED (like theme-store.ts)
// In the App Router, a JS module is cached for the lifetime of the Node.js
// server process. A `const store = create(...)` at module scope would be
// shared across every concurrent HTTP request — meaning user A's todos
// could leak into user B's render. Pure-client state (like theme) sidesteps
// this because the store is never meaningfully written during SSR. But
// the moment your initial state depends on per-request data (cookies, db,
// route params), module-scoped becomes a real data-leak bug.
//
// 🧠 THE FIX — factory + Provider + ref-stable instance
// 1) Expose a `createTodoStore()` factory that returns a fresh store each call
// 2) A React provider creates ONE store per provider instance via useRef
// 3) Consumers call `useTodoStore(selector)` which reads from context
//
// Each server render gets a fresh provider → fresh store. Client navigation
// keeps the same provider mounted → same store. SSR-safe + DevTools-safe.
//
// 📚 Reference: https://docs.pmnd.rs/zustand/guides/nextjs
// =============================================================================

import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { devtools, persist } from 'zustand/middleware';

export type Todo = {
    id: string;
    text: string;
    done: boolean;
};

type TodoState = {
    todos: Todo[];
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    removeTodo: (id: string) => void;
    clearCompleted: () => void;
};

type TodoStore = StoreApi<TodoState>;

// -----------------------------------------------------------------------------
// Factory — call it once per provider instance to get an isolated store.
// Note: `createStore` (vanilla) is the lower-level primitive; `create` from
// 'zustand' is just `createStore` wrapped in a React hook. For the
// provider pattern we want the vanilla store and bind the hook ourselves.
// -----------------------------------------------------------------------------
export const createTodoStore = (): TodoStore =>
    createStore<TodoState>()(
        devtools(
            persist(
                set => ({
                    todos: [],
                    addTodo: text =>
                        set(
                            state => ({
                                todos: [
                                    ...state.todos,
                                    {
                                        // ?.() is the OPTIONAL CALL chain: if
                                        // randomUUID isn't a function (older
                                        // browsers, non-secure contexts), the
                                        // call short-circuits to undefined
                                        // instead of throwing, letting ?? fall
                                        // through to the Math.random fallback.
                                        id:
                                            globalThis.crypto?.randomUUID?.() ??
                                            `id-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                                        text,
                                        done: false,
                                    },
                                ],
                            }),
                            false,
                            'todo/add',
                        ),
                    toggleTodo: id =>
                        set(
                            state => ({
                                todos: state.todos.map(t =>
                                    t.id === id ? { ...t, done: !t.done } : t,
                                ),
                            }),
                            false,
                            'todo/toggle',
                        ),
                    removeTodo: id =>
                        set(
                            state => ({
                                todos: state.todos.filter(t => t.id !== id),
                            }),
                            false,
                            'todo/remove',
                        ),
                    clearCompleted: () =>
                        set(
                            state => ({
                                todos: state.todos.filter(t => !t.done),
                            }),
                            false,
                            'todo/clearCompleted',
                        ),
                }),
                {
                    name: 'living-notebook:zustand-todos',
                },
            ),
            {
                name: 'living-notebook/todo-store',
            },
        ),
    );

// -----------------------------------------------------------------------------
// Provider + hook
// -----------------------------------------------------------------------------

const TodoStoreContext = createContext<TodoStore | null>(null);

export function TodoStoreProvider({ children }: { children: ReactNode }) {
    // useState's LAZY initialiser runs ONCE per mounted provider instance and
    // the returned tuple's first slot has stable identity across re-renders.
    // Equivalent to `useRef + null check` (the alternative the Zustand docs
    // show) but plays nicely with React 19's react-hooks/refs lint rule:
    // we're reading state, not a ref, so no "ref during render" complaint.
    const [store] = useState(createTodoStore);
    return (
        <TodoStoreContext.Provider value={store}>
            {children}
        </TodoStoreContext.Provider>
    );
}

/**
 * Read from the Todo store via a selector. Re-renders the consumer only when
 * the selector's result changes (Object.is). For multi-field reads, prefer
 * multiple narrow selectors over `s => ({ a, b })` (which creates a new
 * object on every read → infinite re-renders unless wrapped in useShallow).
 */
export function useTodoStore<T>(selector: (state: TodoState) => T): T {
    const store = useContext(TodoStoreContext);
    if (store === null) {
        throw new Error(
            'useTodoStore must be used inside <TodoStoreProvider> (app/lessons/zustand-store/layout.tsx).',
        );
    }
    return useStore(store, selector);
}
