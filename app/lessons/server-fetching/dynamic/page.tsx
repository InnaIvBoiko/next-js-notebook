// =============================================================================
// app/lessons/server-fetching/dynamic/page.tsx
// SERVER COMPONENT demonstrating cookies()/headers() forcing DYNAMIC rendering.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS DEMO PROVES
//
// Calling `await cookies()` or `await headers()` inside a Server Component
// reads per-request data. Next cannot prerender a route whose output depends
// on the request — so it marks this route as DYNAMIC.
//
// You see the consequence below in `serverTime`: it's regenerated on every
// navigation/refresh. There is no static HTML cached on disk for this URL.
//
// 🧠 BREAKING CHANGE
// In Next 15+, cookies(), headers() and draftMode() are ASYNC. Most older
// tutorials show `cookies().get('foo')` synchronously — that no longer works.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
// =============================================================================

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import DemoHeader from '../_components/demo-header';
import CookieControls from '../_components/cookie-controls';

export const metadata: Metadata = {
    title: 'Dynamic route · Server Fetching · Living Notebook',
};

// Headers can be sensitive (auth tokens, traffic-shaping IDs). We expose only
// a small whitelist of headers that are useful for the demo and safe to show.
const SAFE_HEADERS = [
    'host',
    'user-agent',
    'accept-language',
    'sec-ch-ua-platform',
    'sec-fetch-mode',
];

export default async function DynamicDemoPage() {
    // 👇 Both are async in Next 15+. Awaiting them is what marks the route as
    //    dynamic (Next sees these awaits during render and bails out of
    //    prerendering).
    const cookieStore = await cookies();
    const headerStore = await headers();

    // Snapshot the cookies as plain { name, value } objects so we can render
    // them. cookieStore.getAll() returns RequestCookie objects.
    const allCookies = cookieStore.getAll();

    // Pick the safe headers and present them in display order.
    const selectedHeaders = SAFE_HEADERS.map(name => ({
        name,
        value: headerStore.get(name),
    })).filter(h => h.value !== null);

    const serverTime = new Date().toISOString();

    return (
        <article className='space-y-8'>
            <DemoHeader which='dynamic' />

            {/* Server time — the dynamism proof. */}
            <section className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4'>
                <p className='text-xs font-semibold tracking-wide text-amber-200 uppercase'>
                    server time · regenerated every request
                </p>
                <p className='mt-1 font-mono text-sm text-amber-100'>
                    {serverTime}
                </p>
            </section>

            {/* Interactive cookie controls — Client island. */}
            <section className='space-y-3'>
                <CookieControls />
            </section>

            {/* await cookies() result */}
            <section className='space-y-2'>
                <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                    await cookies() — {allCookies.length} cookie
                    {allCookies.length === 1 ? '' : 's'} read on the server
                </p>
                <div className='overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40'>
                    {allCookies.length === 0 ? (
                        <p className='p-3 text-xs text-slate-500 italic'>
                            — no cookie sent in this request —
                        </p>
                    ) : (
                        <ul className='divide-y divide-slate-800/60 font-mono text-xs'>
                            {allCookies.map(c => (
                                <li
                                    key={c.name}
                                    className='flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between'
                                >
                                    <span className='text-amber-300'>
                                        {c.name}
                                    </span>
                                    <span className='truncate text-slate-400'>
                                        {c.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {/* await headers() result (whitelisted) */}
            <section className='space-y-2'>
                <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase'>
                    await headers() — whitelisted subset
                </p>
                <div className='overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40'>
                    <ul className='divide-y divide-slate-800/60 font-mono text-xs'>
                        {selectedHeaders.map(h => (
                            <li
                                key={h.name}
                                className='flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between'
                            >
                                <span className='text-sky-300'>{h.name}</span>
                                <span className='break-all text-slate-400 sm:max-w-[60%] sm:text-right'>
                                    {h.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </article>
    );
}
