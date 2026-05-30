'use client';
// =============================================================================
// app/lessons/auth-setup/_components/protected-api-test.tsx
// LAB 5 — manually fire GET /api/me/notes and inspect the auth-aware response.
// -----------------------------------------------------------------------------
// 🧠 The lab proves the Route Handler enforces auth without trusting the UI:
//   • Signed in   → 200 + { notes: [...] }
//   • Signed out  → 401 + { error: 'Unauthorized.' }
// Same fetch from the same browser, different cookie → different answer.
// =============================================================================

import { useState } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

export default function ProtectedApiTest() {
    const lang = useLang();
    const labels = content[lang].labs.apiTest;
    const [status, setStatus] = useState<number | null>(null);
    const [body, setBody] = useState<string>('');
    const [isCalling, setIsCalling] = useState(false);

    async function call() {
        setIsCalling(true);
        setStatus(null);
        setBody('');
        try {
            const res = await fetch('/api/me/notes', { cache: 'no-store' });
            setStatus(res.status);
            const text = await res.text();
            try {
                setBody(JSON.stringify(JSON.parse(text), null, 2));
            } catch {
                setBody(text);
            }
        } finally {
            setIsCalling(false);
        }
    }

    return (
        <div className='space-y-2'>
            <button
                type='button'
                onClick={call}
                disabled={isCalling}
                className='inline-flex items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60'
                suppressHydrationWarning
            >
                {isCalling ? labels.callingLabel : labels.callLabel}
            </button>
            {status !== null && (
                <div className='flex items-center gap-2 text-[11px]'>
                    <span
                        className='text-slate-400 uppercase'
                        suppressHydrationWarning
                    >
                        {labels.statusLabel}
                    </span>
                    <code
                        className={`rounded px-2 py-0.5 font-mono ${
                            status >= 200 && status < 300
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : status === 401
                                  ? 'bg-rose-500/20 text-rose-200'
                                  : 'bg-amber-500/20 text-amber-200'
                        }`}
                    >
                        {status}
                    </code>
                </div>
            )}
            {body && (
                <div className='space-y-1'>
                    <span
                        className='block text-[10px] tracking-wide text-slate-500 uppercase'
                        suppressHydrationWarning
                    >
                        {labels.responseLabel}
                    </span>
                    <pre className='max-h-48 overflow-auto rounded-md border border-slate-800 bg-slate-950/60 p-2 font-mono text-[11px] leading-relaxed text-slate-200'>
                        {body}
                    </pre>
                </div>
            )}
        </div>
    );
}
