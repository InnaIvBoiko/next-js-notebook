'use client';
// =============================================================================
// app/lessons/context-provider/_components/render-counter.tsx
// Tiny custom hook + badge that visualises how many times a component has
// rendered. Uses useRef (mutable, doesn't trigger re-renders itself).
// -----------------------------------------------------------------------------
// 🧠 HYDRATION SAFETY
// The mutation happens on every function invocation. The badge defers display
// behind a `mounted` flag so server and first client render emit the same
// HTML ('—') — otherwise React would warn about hydration divergence and
// regenerate the tree, breaking the first click.
//
// 🧠 STRICTMODE DOUBLE-INVOKE
// React 19 dev StrictMode invokes function components TWICE on every render
// to detect impure renders. Both invocations share the same `useRef` object,
// so a naive `ref.current += 1` produces +2 per logical render. We divide by
// 2 at return time so the badge shows the logical count (+1 per click in
// dev, matching what the production user would see).
//
// 🧠 WHAT YOU'LL SEE
// After mount: every badge shows 1. Click a theme button → badges of cards 1
// (Reader) and 3 (Combined) tick to 2, then 3, then 4. Card 2 (Split writer)
// stays at 1 forever — proof its component never re-renders.
// =============================================================================

import { useEffect, useRef, useState } from 'react';

export function useRenderCount(): number {
    const ref = useRef(0);
    // We intentionally mutate AND read the ref during render. That violates
    // react-hooks/refs in general (refs shouldn't influence rendered output),
    // but this hook IS the debug visualisation. Hiding the increment in a
    // useEffect would lag the count by one render and complicate the API.
    // eslint-disable-next-line react-hooks/refs -- intentional render counter
    ref.current += 1;
    // Divide by 2 to neutralise React 19 dev StrictMode's double-invoke and
    // display the LOGICAL render count. ceil() guarantees the first commit is
    // 1 (not 0.5 → 1) and every subsequent logical render adds exactly 1.
    // In production (no StrictMode) this would halve the real count — but the
    // RenderBadge is a dev-only debugging visual; production builds don't
    // render it as user-facing UI.
    // eslint-disable-next-line react-hooks/refs -- intentional render counter
    return Math.ceil(ref.current / 2);
}

export function RenderBadge({ label, count }: { label: string; count: number }) {
    // Defer the displayed value until after mount so server and first client
    // render emit identical HTML ('—' on both). React commits the placeholder,
    // hydrates cleanly, THEN this effect fires and we swap in the real count.
    //
    // react-hooks/set-state-in-effect — disabled intentionally. The cascading
    // render that the rule warns about IS the SSR-safe hydration trick: we
    // need server output ('—') and first client render to match before we can
    // safely display anything browser-specific. Same pattern as the
    // sessionStorage hydration in LangProvider/ThemeProvider.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- post-hydration unveil
        setMounted(true);
    }, []);

    return (
        <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide whitespace-nowrap text-slate-300'>
            <span className='inline-block h-1.5 w-1.5 rounded-full bg-sky-400' />
            <span>{label}</span>
            <span className='text-sky-300'>{mounted ? count : '—'}</span>
        </span>
    );
}
