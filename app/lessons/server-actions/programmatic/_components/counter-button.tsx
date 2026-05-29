'use client';
// =============================================================================
// CounterButton — Client island that invokes Server Actions via onClick.
// -----------------------------------------------------------------------------
// 🧠 PATTERN
// Server Actions imported into a Client Component become regular async
// functions. You await them. The return value comes back over the wire.
//
// Here:
//   • onClick fires bumpCounterAction() — the server reads the nb-counter
//     cookie, increments it, writes it back via cookieStore.set(), and
//     returns the new value.
//   • We capture the returned value into useState so the displayed count
//     updates instantly (no full page reload).
//
// The cookie is also re-sent on the next HTTP request automatically — so a
// hard refresh (Cmd+R) reads the new value server-side too.
// =============================================================================

import { useState, useTransition } from 'react';
import {
    bumpCounterAction,
    resetCounterAction,
} from '../../_lib/actions';

export default function CounterButton({
    initialCount,
}: {
    initialCount: number;
}) {
    const [count, setCount] = useState(initialCount);
    // useTransition lets the UI stay responsive while the Server Action
    // round-trip is in flight. We are not showing pending UI here — that's
    // Lesson 4 — but using it is the cleanest non-blocking invocation.
    const [isPending, startTransition] = useTransition();

    function bump() {
        startTransition(async () => {
            const next = await bumpCounterAction();
            setCount(next);
        });
    }

    function reset() {
        startTransition(async () => {
            const next = await resetCounterAction();
            setCount(next);
        });
    }

    return (
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'>
            <div className='flex items-center gap-4'>
                <span className='text-5xl font-bold tabular-nums text-violet-300'>
                    {count}
                </span>
                {isPending && (
                    <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-violet-400' />
                )}
            </div>
            <div className='flex flex-wrap gap-2'>
                <button
                    type='button'
                    onClick={bump}
                    className='inline-flex items-center gap-2 rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-400'
                >
                    +1
                </button>
                <button
                    type='button'
                    onClick={reset}
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
