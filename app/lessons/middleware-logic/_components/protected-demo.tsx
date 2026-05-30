'use client';
// =============================================================================
// app/lessons/middleware-logic/_components/protected-demo.tsx
// LAB 3 — Grant / revoke the demo cookie + link to /protected.
// -----------------------------------------------------------------------------
// 🧠 The proxy checks `nb-demo-pass === '1'` on every request to /protected*.
// We expose two Server Actions to set/clear the cookie + a Link to the
// protected subroute. The "wasDenied" flag is wired in index-view.tsx
// (renders the orange banner above the lab if you got redirected here).
// =============================================================================

import Link from 'next/link';
import { useTransition } from 'react';
import { useLang } from '../../_components/lang-provider';
import {
    grantDemoPassAction,
    revokeDemoPassAction,
} from '../_lib/actions';
import { content } from '../_lib/content';

export default function ProtectedDemo({
    cookieValue,
}: {
    cookieValue: string | null;
}) {
    const lang = useLang();
    const labels = content[lang].labs.protected;
    const [isGranting, startGrant] = useTransition();
    const [isRevoking, startRevoke] = useTransition();

    const hasPass = cookieValue === '1';

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2'>
                <span className='text-[11px] tracking-wide text-slate-400 uppercase'>
                    {labels.cookieStatusLabel}
                </span>
                <span
                    className={`rounded px-2 py-0.5 font-mono text-xs ${
                        hasPass
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-rose-500/20 text-rose-200'
                    }`}
                >
                    {hasPass ? labels.cookiePresent : labels.cookieAbsent}
                </span>
            </div>

            <div className='flex flex-wrap gap-2'>
                <button
                    type='button'
                    disabled={isGranting || hasPass}
                    onClick={() => startGrant(() => grantDemoPassAction())}
                    className='rounded-md border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50'
                >
                    {isGranting ? labels.grantingLabel : labels.grantLabel}
                </button>
                <button
                    type='button'
                    disabled={isRevoking || !hasPass}
                    onClick={() => startRevoke(() => revokeDemoPassAction())}
                    className='rounded-md border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50'
                >
                    {labels.revokeLabel}
                </button>
                <Link
                    href='/lessons/middleware-logic/protected'
                    className='rounded-md border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-500/25'
                >
                    {labels.visitLabel}
                </Link>
            </div>
        </div>
    );
}
