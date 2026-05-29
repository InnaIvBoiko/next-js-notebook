'use client';
// =============================================================================
// app/lessons/context-provider/_components/theme-provider.tsx
// LESSON DEMO — split-context Theme provider (LOCAL to this lesson only).
// -----------------------------------------------------------------------------
// 🧠 Why local, not lifted to /lessons/layout.tsx?
// The Theme demo is the SUBJECT of the lab. We want each visit to the lesson
// to start from a known state and we want the React tree of the provider to
// be scoped to this lesson's subtree. So we mount it from the lesson's own
// layout. Compare with <LangProvider>, which IS lifted to /lessons/layout.tsx
// because the language is shared across the WHOLE notebook.
// =============================================================================

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light' | 'amber';

const STORAGE_KEY = 'living-notebook:theme';

// 👇 Two separate contexts — the heart of the optimisation.
const ThemeStateContext = createContext<Theme | null>(null);
const ThemeSetterContext = createContext<((t: Theme) => void) | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeRaw] = useState<Theme>('dark');

    // Hydrate from sessionStorage on mount. Server cannot run this — that's
    // the source of the brief flicker discussed in §4 of the lesson copy.
    //
    // react-hooks/set-state-in-effect warns against this because cascading
    // re-renders generally indicate a missing initial state. Here it's
    // unavoidable: sessionStorage is a browser-only API, so we can't read it
    // synchronously during render (the server has no sessionStorage and we
    // need a stable initial value to keep SSR and the first client render in
    // sync). The "cascading render" is exactly the flicker we teach about.
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved === 'dark' || saved === 'light' || saved === 'amber') {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only hydration
                setThemeRaw(saved);
            }
        } catch {
            /* sessionStorage unavailable */
        }
    }, []);

    // Stable setter — the whole split-context trick collapses without this.
    const setTheme = useCallback((next: Theme) => {
        setThemeRaw(next);
        try {
            sessionStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore */
        }
    }, []);

    return (
        <ThemeSetterContext.Provider value={setTheme}>
            <ThemeStateContext.Provider value={theme}>
                {children}
            </ThemeStateContext.Provider>
        </ThemeSetterContext.Provider>
    );
}

/** Reader hook — subscribes the consumer to theme changes. */
export function useThemeState(): Theme {
    const v = useContext(ThemeStateContext);
    if (v === null) {
        throw new Error('useThemeState must be used inside <ThemeProvider>');
    }
    return v;
}

/** Writer hook — does NOT subscribe to theme changes (setter is stable). */
export function useThemeSetter(): (t: Theme) => void {
    const v = useContext(ThemeSetterContext);
    if (v === null) {
        throw new Error('useThemeSetter must be used inside <ThemeProvider>');
    }
    return v;
}

/**
 * "Combined" reader+writer — the anti-pattern shown for comparison in the lab.
 * Any consumer of this hook subscribes to BOTH contexts, so it re-renders
 * when the theme changes even if it only needs setTheme. Memoising the return
 * object does NOT help: the StateContext subscription is what triggers the
 * render. This is the educational "what NOT to do".
 */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
    const theme = useThemeState();
    const setTheme = useThemeSetter();
    return useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
}
