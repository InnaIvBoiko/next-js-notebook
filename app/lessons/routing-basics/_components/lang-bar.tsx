'use client';
// Switcher pill — consumes the lang Context provided by the layout above.
// Lives in the layout chrome, so it stays mounted (and visible) across all
// routes under /lessons/routing-basics/*.

import { LANGS } from '../../../_lib/dictionaries';
import { useLessonLang } from './lang-provider';

export default function LangBar() {
    const { lang, setLang } = useLessonLang();
    return (
        <div className='flex items-center justify-end'>
            <div
                role='radiogroup'
                aria-label='Lesson language'
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
        </div>
    );
}
