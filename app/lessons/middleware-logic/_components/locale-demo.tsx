'use client';
// =============================================================================
// app/lessons/middleware-logic/_components/locale-demo.tsx
// LAB 1 — shows the current `nb-lang` cookie + a button to clear it.
// -----------------------------------------------------------------------------
// Clearing the cookie forces the proxy to re-sniff `Accept-Language` on the
// next request. Useful in the lab to SEE the sniff happen in DevTools.
// =============================================================================

import { useTransition } from 'react';
import { useLang } from '../../_components/lang-provider';
import { clearLangCookieAction } from '../_lib/actions';
import { content } from '../_lib/content';

export default function LocaleDemo({
    cookieValue,
}: {
    cookieValue: string | null;
}) {
    const lang = useLang();
    const labels = content[lang].labs.locale;
    const [isPending, startTransition] = useTransition();

    return (
        <div className='space-y-3'>
            <div className='flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2'>
                <span className='text-[11px] tracking-wide text-slate-400 uppercase'>
                    {labels.cookieLabel}
                </span>
                <code
                    className={`rounded px-2 py-0.5 font-mono text-xs ${
                        cookieValue
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-slate-700/50 text-slate-400'
                    }`}
                >
                    {cookieValue ?? '(unset)'}
                </code>
            </div>
            <button
                type='button'
                disabled={isPending}
                onClick={() => startTransition(() => clearLangCookieAction())}
                className='inline-flex items-center gap-2 rounded-md border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60'
            >
                {isPending ? labels.clearingLabel : labels.clearLabel}
            </button>
            <p className='text-[11px] text-slate-500'>
                {labels.instructionsLabel}
            </p>
        </div>
    );
}
