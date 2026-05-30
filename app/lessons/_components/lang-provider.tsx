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
// classic React performance fix.
//
// 🧠 PROVIDER PLACEMENT
// This provider lives at `app/lessons/layout.tsx`, which means the React
// instance is preserved across navigation between sibling lessons. Switching
// language in /lessons/caching persists into /lessons/server-actions.
//
// 🧠 PERSISTENCE — cookie-first (Module 4 · Lesson 4 refactor)
// The proxy at `/proxy.ts` sniffs `Accept-Language` and writes the `nb-lang`
// cookie on first visit. The lessons layout reads that cookie SERVER-SIDE
// via `cookies()` and passes it down as `initialLang`. The provider uses
// it as the initial state — SSR and client agree on the same language from
// render 0 → NO MORE hydration mismatch.
//
// When the user changes language via <LangBar>, we write the cookie back
// from the client (`document.cookie`) so the NEXT server render uses the
// new value. We also keep sessionStorage as a tiny belt-and-suspenders
// fallback for cases where cookies are disabled.
// =============================================================================

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import type { Lang } from '../../_lib/dictionaries';

const COOKIE_NAME = 'nb-lang';
const STORAGE_KEY = 'living-notebook:lang';

const LangStateContext = createContext<Lang | null>(null);
const LangSetterContext = createContext<((l: Lang) => void) | null>(null);

export function LangProvider({
    initialLang,
    children,
}: {
    initialLang: Lang;
    children: ReactNode;
}) {
    // ✨ The initial value comes from the server, derived from the
    // `nb-lang` cookie. SSR HTML and client first render now agree
    // — no more useEffect "flicker", no more hydration mismatch.
    const [lang, setLangRaw] = useState<Lang>(initialLang);

    // Stable setter wrapped in useCallback so the SetterContext value is
    // referentially stable across re-renders. Without this, every render
    // would publish a new function and defeat the split-context optimisation.
    const setLang = useCallback((next: Lang) => {
        setLangRaw(next);
        // Persist to BOTH cookie (so the next SSR sees it) AND sessionStorage
        // (defensive: works even if the user disabled cookies). The cookie
        // matches the proxy's expectations: name `nb-lang`, path /, 1y maxAge.
        try {
            const oneYear = 60 * 60 * 24 * 365;
            document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
        } catch {
            /* ignore — older browsers, file:// scheme */
        }
        try {
            sessionStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* sessionStorage unavailable — cookie still in place */
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
