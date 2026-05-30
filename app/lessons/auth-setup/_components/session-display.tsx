'use client';
// =============================================================================
// app/lessons/auth-setup/_components/session-display.tsx
// LAB 1 — shows the session object resolved server-side by auth().
// -----------------------------------------------------------------------------
// 🧠 Receives the session as a SERIALISABLE prop from the page.tsx Server
// Component. We don't call auth() here — RSC already did. This keeps the
// client bundle small (no Auth.js client SDK needed for read-only display)
// and demonstrates the "server resolves, client renders" pattern.
//
// 🛑 suppressHydrationWarning on labels — same reason as /database-orm:
// streaming + post-hydration LangProvider language switch can mismatch.
// =============================================================================

import { useTransition } from 'react';
import type { Session } from 'next-auth';
import { useLang } from '../../_components/lang-provider';
import { signOutAction } from '../_lib/actions';
import { content } from '../_lib/content';

export default function SessionDisplay({ session }: { session: Session | null }) {
    const lang = useLang();
    const labels = content[lang].labs.session;
    const [isPending, startTransition] = useTransition();

    if (!session?.user) {
        return (
            <div className='flex items-center gap-3 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2'>
                <span
                    className='inline-block h-2.5 w-2.5 rounded-full bg-slate-500'
                    aria-hidden
                />
                <span
                    className='text-sm text-slate-400'
                    suppressHydrationWarning
                >
                    {labels.signedOutLabel}
                </span>
            </div>
        );
    }

    return (
        <div className='space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2'>
            <div className='flex items-center gap-2'>
                <span
                    className='inline-block h-2.5 w-2.5 rounded-full bg-emerald-400'
                    aria-hidden
                />
                <span
                    className='text-sm text-emerald-200'
                    suppressHydrationWarning
                >
                    {labels.signedInLabel}
                </span>
                <span className='font-mono text-xs text-slate-200'>
                    {session.user.name ?? session.user.email}
                </span>
            </div>
            <pre className='overflow-x-auto rounded bg-slate-950/60 p-2 font-mono text-[10px] leading-relaxed text-slate-400'>
{`{
  "id":    "${session.user.id ?? ''}",
  "name":  ${JSON.stringify(session.user.name ?? null)},
  "email": ${JSON.stringify(session.user.email ?? null)},
  "image": ${JSON.stringify(session.user.image ?? null)}
}`}
            </pre>
            <button
                type='button'
                disabled={isPending}
                onClick={() => startTransition(() => signOutAction())}
                className='rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                suppressHydrationWarning
            >
                {isPending ? labels.signingOutLabel : labels.signOutLabel}
            </button>
        </div>
    );
}
