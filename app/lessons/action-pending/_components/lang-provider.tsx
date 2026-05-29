'use client';

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
            'useLessonLang must be used inside <LangProvider> (app/lessons/action-pending/layout.tsx).',
        );
    }
    return ctx;
}
