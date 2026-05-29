// =============================================================================
// app/lessons/zustand-store/_components/theme-store.ts
// MODULE-SCOPED Zustand store for the Theme mirror demo.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE — module-scoped
// `const useThemeStore = create(...)` evaluates ONCE at module-import time and
// the resulting hook is shared by every consumer that imports it. No provider
// needed — the hook reads from this module-level state.
//
// ⚠️ APP ROUTER CAVEAT (not biting us here)
// On Next.js App Router, a JS module is cached for the lifetime of the Node.js
// server process. A module-scoped store can therefore leak per-user state
// across HTTP requests IF the store is initialised with request-specific data
// on the server. For PURE CLIENT state like theme (no SSR initial value), the
// store is only meaningfully read on the client and the leak risk is moot.
// The Todo demo below shows the factory+provider pattern you need the moment
// per-user data is involved.
//
// 🧠 MIDDLEWARE PIPELINE — outer to inner
//   devtools(  ← Redux DevTools integration (action names + time travel)
//     persist( ← localStorage hydration / write-through
//       (set) => ({ theme, setTheme })   ← the actual state initialiser
//     )
//   )
// =============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'amber';

type ThemeState = {
    theme: Theme;
    setTheme: (t: Theme) => void;
};

export const useThemeStore = create<ThemeState>()(
    devtools(
        persist(
            set => ({
                theme: 'dark',
                // The third argument to `set` is the DevTools action name. It
                // shows up in the Redux DevTools timeline as "theme/set".
                setTheme: t => set({ theme: t }, false, 'theme/set'),
            }),
            {
                name: 'living-notebook:zustand-theme',
            },
        ),
        {
            name: 'living-notebook/theme-store',
        },
    ),
);
