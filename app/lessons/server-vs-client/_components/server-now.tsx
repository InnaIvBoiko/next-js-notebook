// app/lessons/server-vs-client/_components/server-now.tsx
//
// 🧠 SERVER COMPONENT (no 'use client' directive).
// Everything in this file runs ONLY on the server (Node runtime). The JS
// of this file is NEVER sent to the browser — only its RENDERED OUTPUT
// (HTML + a small RSC payload reference).
//
// Two tricks we use to make the "server-only" nature visible:
//   1. `headers()` from next/headers — an async, request-time API. Calling
//      it forces this route into dynamic rendering, so the timestamp is
//      regenerated on every reload (otherwise Next might prerender it).
//   2. `process.env.NODE_ENV` and `process.versions.node` — values that
//      exist only in the Node.js process. The browser has no `process`.
//   3. console.log lands in the Mac Terminal where `npm run dev` is
//      running, NOT in the browser DevTools console. Try it.

import { headers } from 'next/headers';

export default async function ServerNow() {
    // `headers()` returns a Promise in Next 16 — must be awaited.
    // Reading any header opts the route into request-time (dynamic) rendering.
    const h = await headers();
    const host = h.get('host') ?? 'unknown';

    const now = new Date();
    const renderedAt = now.toISOString();

    // This log appears in the Mac Terminal (npm run dev), NOT in the browser.
    console.log(
        `[ServerNow] rendered on the server at ${renderedAt} for host=${host}`
    );

    return (
        <div className='space-y-3'>
            <p className='text-xs font-semibold tracking-wide text-sky-300 uppercase'>
                Server Component
            </p>
            <dl className='space-y-2 text-sm'>
                <div>
                    <dt className='text-xs text-slate-500'>
                        Timestamp di render (server)
                    </dt>
                    <dd className='font-mono text-slate-100'>{renderedAt}</dd>
                </div>
                <div>
                    <dt className='text-xs text-slate-500'>
                        process.versions.node
                    </dt>
                    <dd className='font-mono text-slate-100'>
                        {process.versions.node}
                    </dd>
                </div>
                <div>
                    <dt className='text-xs text-slate-500'>
                        process.env.NODE_ENV
                    </dt>
                    <dd className='font-mono text-slate-100'>
                        {process.env.NODE_ENV}
                    </dd>
                </div>
                <div>
                    <dt className='text-xs text-slate-500'>
                        request host (da headers())
                    </dt>
                    <dd className='font-mono text-slate-100'>{host}</dd>
                </div>
            </dl>
            <p className='text-xs leading-relaxed text-slate-400'>
                Niente di questo file finisce nel bundle JS del browser. Apri{' '}
                <em>View Source</em>: vedrai i valori già stampati
                nell&apos;HTML iniziale.
            </p>
        </div>
    );
}
