'use client';
// ^^^^^^^^^^^
// 🧠 Lesson-scoped language Context for /dynamic-routes/*.
//
// Mounted inside this lesson's layout.tsx, so its useState survives navigation
// across all routes under /lessons/dynamic-routes — list ↔ detail ↔ another
// detail. That gives us the same persistence guarantee proved in Lesson 2.
//
// Each lesson owns its provider on purpose (no cross-lesson coupling).
// Module 3 will study Context as the subject; here it is just a tool.

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lang } from '../../../_lib/dictionaries';

type LangContextValue = {
    lang: Lang;
    setLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export default function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('it');
    return (
        <LangContext.Provider value={{ lang, setLang }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLessonLang(): LangContextValue {
    const ctx = useContext(LangContext);
    if (ctx === null) {
        throw new Error(
            'useLessonLang must be used inside <LangProvider> (app/lessons/dynamic-routes/layout.tsx).',
        );
    }
    return ctx;
}
