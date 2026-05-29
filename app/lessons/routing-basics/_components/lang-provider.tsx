'use client';
// ^^^^^^^^^^^
// 🧠 React Context provider for the routing-basics lesson language.
//
// This file is mounted INSIDE the routing-basics `layout.tsx`, which means
// its React tree (including the useState below) does NOT unmount when the
// user navigates between sibling segments under /lessons/routing-basics
// (the main lesson, /a, /b). The lang therefore PERSISTS across those
// navigations — exactly the property Lesson 2 teaches.
//
// We forward-reference Context (the dedicated lesson lives in Module 3,
// /context-provider); here it is just a tool, not the subject.

import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';
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

// Custom hook — throws if used outside the provider so we get clear errors.
export function useLessonLang(): LangContextValue {
    const ctx = useContext(LangContext);
    if (ctx === null) {
        throw new Error(
            'useLessonLang must be used inside <LangProvider> (app/lessons/routing-basics/layout.tsx).',
        );
    }
    return ctx;
}
