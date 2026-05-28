// app/lessons/routing-basics/b/page.tsx
// Twin of /a — exists so we can navigate back and forth and observe layout
// persistence + <Link> prefetching in DevTools.

import Link from 'next/link';

export default function SubRouteB() {
    return (
        <div className='space-y-4'>
            <span className='inline-block rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-300'>
                Sub-route B
            </span>
            <h1 className='text-2xl font-bold text-white'>
                /lessons/routing-basics/b
            </h1>
            <p className='text-sm text-slate-400'>
                Stesso layout di /a e della lezione principale. Apri la
                console di rete prima di navigare verso /a: vedrai un{' '}
                <em>prefetch</em> automatico — Next ha già scaricato il
                payload della rotta perché il link è entrato nel viewport.
            </p>
            <div className='flex flex-wrap gap-3'>
                <Link
                    href='/lessons/routing-basics'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    ← Indietro alla lezione
                </Link>
                <Link
                    href='/lessons/routing-basics/a'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    → Vai a Sub-route A
                </Link>
            </div>
        </div>
    );
}
