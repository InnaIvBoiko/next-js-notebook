'use client';
// =============================================================================
// app/lessons/_components/lang-provider.tsx
// SHARED Language provider for the WHOLE /lessons/* subtree.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE — split contexts
// We expose TWO contexts, not one:
//   • LangStateContext  → holds the current `lang` value. Consumers of this
//                         context re-render whenever the user switches language.
//   • LangSetterContext → holds the stable `setLang` function. Consumers of
//                         this context (e.g. the <LangBar> buttons) re-render
//                         only when the function reference changes — which it
//                         never does, because useState's setter is stable.
//
// Why split? With a single `{ lang, setLang }` value, every Context.Provider
// `value` is a NEW object on each render, which forces ALL consumers to
// re-render even if they only read `setLang`. Splitting the contexts is the
// classic React performance fix — and it's the conceptual bridge to selector
// libraries like Zustand (next lesson).
//
// 🧠 PROVIDER PLACEMENT
// This provider lives at `app/lessons/layout.tsx`, which means the React
// instance is preserved across navigation between sibling lessons. Switching
// language in /lessons/caching persists into /lessons/server-actions.
//
// 🧠 PERSISTENCE — sessionStorage with a sync useEffect
// We initialise from the BASE language ('it') on the server / first client
// render to avoid hydration mismatches (the server cannot read sessionStorage),
// then on mount we read sessionStorage and update if a saved value exists.
// This causes a brief "flicker" if the user previously picked a non-base lang —
// that flicker is intentional teaching material for the next lesson, where
// cookies (readable on the server) will eliminate it.
// =============================================================================

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import type { Lang } from '../../_lib/dictionaries';

const STORAGE_KEY = 'living-notebook:lang';

const LangStateContext = createContext<Lang | null>(null);
const LangSetterContext = createContext<((l: Lang) => void) | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLangRaw] = useState<Lang>('it');

    // Mount-time hydration from sessionStorage. Runs ONCE per browser session.
    // Wrapped in try/catch because sessionStorage can throw in private windows
    // or when storage quota is exceeded.
    //
    // 🛑 react-hooks/set-state-in-effect — disabled intentionally.
    // sessionStorage is a browser-only API, so we cannot read it during the
    // useState initialiser without breaking SSR/CSR hydration parity (the
    // server would have no saved value). The "cascading render" that the rule
    // warns about IS the flicker that Module 3 · Lesson 1 explains and that
    // we'll fix in /advanced-routing with cookies (which the server can read).
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved === 'it' || saved === 'en' || saved === 'uk') {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only hydration
                setLangRaw(saved);
            }
        } catch {
            /* sessionStorage unavailable — fall back to in-memory state */
        }
    }, []);

    // Stable setter wrapped in useCallback so the SetterContext value is
    // referentially stable across re-renders. Without this, every render
    // would publish a new function and defeat the split-context optimisation.
    const setLang = useCallback((next: Lang) => {
        setLangRaw(next);
        try {
            sessionStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore — state still updates in memory */
        }
    }, []);

    return (
        <LangSetterContext.Provider value={setLang}>
            <LangStateContext.Provider value={lang}>
                {children}
            </LangStateContext.Provider>
        </LangSetterContext.Provider>
    );
}

// -----------------------------------------------------------------------------
// Consumer hooks
// -----------------------------------------------------------------------------

/** Read the current language. Re-renders the consumer on language change. */
export function useLang(): Lang {
    const value = useContext(LangStateContext);
    if (value === null) {
        throw new Error(
            'useLang must be used inside <LangProvider> (app/lessons/layout.tsx).',
        );
    }
    return value;
}

/** Read the stable setter. Does NOT re-render the consumer on language change. */
export function useSetLang(): (l: Lang) => void {
    const value = useContext(LangSetterContext);
    if (value === null) {
        throw new Error(
            'useSetLang must be used inside <LangProvider> (app/lessons/layout.tsx).',
        );
    }
    return value;
}

/**
 * Backwards-compatible shape used by lessons written BEFORE the lift refactor.
 * Returns `{ lang, setLang }` so existing call sites keep compiling unchanged.
 *
 * ⚠️ Trade-off: consumers of `useLessonLang()` subscribe to BOTH contexts,
 * which means they re-render on language change even if they only use
 * `setLang`. Prefer the split hooks (`useLang` / `useSetLang`) in new code.
 */
export function useLessonLang(): { lang: Lang; setLang: (l: Lang) => void } {
    return { lang: useLang(), setLang: useSetLang() };
}
