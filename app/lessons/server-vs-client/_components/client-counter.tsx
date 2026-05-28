'use client';
// ^^^^^^^^^^^
// 🧠 CLIENT COMPONENT.
// The 'use client' directive marks the BOUNDARY between the Server and Client
// module graphs. Everything imported from this file (and everything it
// imports, recursively) becomes part of the CLIENT BUNDLE — JavaScript that
// the browser must download and parse before the component becomes
// interactive.
//
// Symmetric counterpart of <ServerNow />:
//   - useState → only works on the client (React hooks need a runtime).
//   - useSyncExternalStore → reads the client-only hydration timestamp
//     with an SSR fallback, without ever calling setState inside useEffect
//     (which the react-hooks/set-state-in-effect lint rule discourages).
//   - useEffect (with NO setState inside) is the right tool for a pure
//     side-effect like console.log.

import { useEffect, useState, useSyncExternalStore } from 'react';

// -----------------------------------------------------------------------------
// Hydration timestamp store — read once per page load.
// -----------------------------------------------------------------------------
// `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` is React's
// official way to read a value that differs between server and client without
// the useEffect-then-setState cascade. Flow:
//   • On the server, React calls `getServerHydrationTime` → null. The HTML
//     ships with the SSR placeholder.
//   • On the client's first render, React calls `getClientHydrationTime`
//     which lazily captures `new Date()` and caches it module-side.
//   • `subscribe` is a no-op: the value never changes after first read.
//
// Module-level cache is fine here because the timestamp is conceptually
// "the moment this bundle hydrated in this browser" — one per page load.

const subscribe = () => () => {};

let cachedHydrationTime: string | null = null;
const getClientHydrationTime = (): string => {
    if (cachedHydrationTime === null) {
        cachedHydrationTime = new Date().toISOString();
    }
    return cachedHydrationTime;
};
const getServerHydrationTime = (): string | null => null;

export default function ClientCounter() {
    const [count, setCount] = useState(0);

    // Returns string on the client, null during SSR. React reconciles the
    // SSR → client transition without any cascading state update from us.
    const mountedAt = useSyncExternalStore(
        subscribe,
        getClientHydrationTime,
        getServerHydrationTime,
    );

    useEffect(() => {
        // Pure side-effect: log to the browser DevTools console. No setState
        // here, so the react-hooks/set-state-in-effect rule stays quiet.
        console.log(
            `[ClientCounter] hydrated in the browser at ${new Date().toISOString()}`,
        );
    }, []);

    return (
        <div className='space-y-3'>
            <p className='text-xs font-semibold tracking-wide text-violet-300 uppercase'>
                Client Component
            </p>
            <dl className='space-y-2 text-sm'>
                <div>
                    <dt className='text-xs text-slate-500'>
                        useState · count
                    </dt>
                    <dd className='font-mono text-slate-100'>{count}</dd>
                </div>
                <div>
                    <dt className='text-xs text-slate-500'>
                        Timestamp di hydration (client)
                    </dt>
                    <dd className='font-mono text-slate-100'>
                        {mountedAt ?? '— SSR placeholder —'}
                    </dd>
                </div>
            </dl>
            <button
                type='button'
                onClick={() => setCount(c => c + 1)}
                className='inline-flex items-center gap-2 rounded-md bg-violet-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-400'
            >
                Incrementa
            </button>
            <p className='text-xs leading-relaxed text-slate-400'>
                Apri DevTools → Network → filtro JS: il file{' '}
                <code className='font-mono text-violet-300'>
                    client-counter
                </code>{' '}
                viene scaricato. Quello di <code>server-now</code> NO.
            </p>
        </div>
    );
}
