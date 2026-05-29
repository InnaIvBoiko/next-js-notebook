// =============================================================================
// app/lessons/server-actions/programmatic/page.tsx
// SERVER COMPONENT — reads the cookie counter, hands it to a Client button.
// -----------------------------------------------------------------------------
// The static shell renders DemoHeader + explanatory boxes. A Suspense'd leaf
// (<CounterSection/>) reads `await cookies()` (a per-request API) and renders
// the Client <CounterButton/> with the initial count from the cookie.
//
// Reading cookies() automatically marks the page as dynamic — no need for
// connection() here.
// =============================================================================

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import DemoHeader from '../_components/demo-header';
import CounterButton from './_components/counter-button';

export const metadata: Metadata = {
    title: 'Programmatic invocation · Server Actions · Living Notebook',
};

const COUNTER_COOKIE = 'nb-counter';

async function CounterSection() {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COUNTER_COOKIE)?.value ?? '0';
    const initial = Number.parseInt(raw, 10);
    const initialCount = Number.isFinite(initial) ? initial : 0;
    return (
        <div className='space-y-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-6'>
            <p className='text-xs font-semibold tracking-wide text-violet-200 uppercase'>
                Counter (stored in nb-counter cookie)
            </p>
            <CounterButton initialCount={initialCount} />
            <p className='border-t border-violet-500/20 pt-3 text-[11px] text-slate-500'>
                Server-read initial value: <span className='font-mono'>{initialCount}</span>.
                Click +1 — onClick handler in the Client Component awaits
                bumpCounterAction() and updates useState.
            </p>
        </div>
    );
}

function CounterSkeleton() {
    return (
        <div className='space-y-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-6'>
            <div className='h-3 w-48 animate-pulse rounded bg-slate-800' />
            <div className='h-12 w-24 animate-pulse rounded bg-slate-800' />
        </div>
    );
}

export default function ProgrammaticDemoPage() {
    return (
        <article className='space-y-8'>
            <DemoHeader which='programmatic' />

            <Suspense fallback={<CounterSkeleton />}>
                <CounterSection />
            </Suspense>

            <section className='space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4'>
                <p className='text-sm font-semibold text-violet-200'>
                    🖱️ Takeaway
                </p>
                <p className='text-xs leading-relaxed text-slate-300'>
                    Click +1 three times. Each click sends a POST to the
                    server which: (1) reads nb-counter, (2) increments it,
                    (3) calls cookieStore.set() to write the new value, (4)
                    returns the number. The Client receives the response and
                    updates useState. Reload (Cmd+R): the counter keeps its
                    value — it&apos;s in the cookie, readable by the server on
                    the next render.
                </p>
                <p className='border-t border-violet-500/20 pt-3 text-[11px] leading-relaxed text-slate-500'>
                    👀 DevTools → Application → Cookies → http://localhost:3000
                    — look for <span className='font-mono'>nb-counter</span>.
                </p>
            </section>
        </article>
    );
}
