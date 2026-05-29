'use client';
// =============================================================================
// app/lessons/_components/lang-bar.tsx
// GLOBAL language switcher shown in the /lessons header.
// -----------------------------------------------------------------------------
// Notice the two hooks: useLang() to highlight the active chip, useSetLang()
// for the onClick. They come from SEPARATE contexts, so this component
// re-renders only when `lang` changes (not when an unrelated consumer renders).
// =============================================================================

import { LANGS } from '../../_lib/dictionaries';
import { useLang, useSetLang } from './lang-provider';

export default function LangBar() {
    const lang = useLang();
    const setLang = useSetLang();

    return (
        <div
            role='radiogroup'
            aria-label='Notebook language'
            className='inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/40 p-1 backdrop-blur'
        >
            {LANGS.map(l => {
                const active = l.code === lang;
                return (
                    <button
                        key={l.code}
                        type='button'
                        role='radio'
                        aria-checked={active}
                        onClick={() => setLang(l.code)}
                        className={[
                            'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase transition-colors',
                            active
                                ? 'bg-sky-500 text-white shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                        ].join(' ')}
                    >
                        <span aria-hidden>{l.flag}</span>
                        <span>{l.code}</span>
                    </button>
                );
            })}
        </div>
    );
}
