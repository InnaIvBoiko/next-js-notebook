// app/lessons/routing-basics/a/page.tsx
// Tiny demo sub-route: shows the file-system → URL mapping in action
// (this file lives under /a, therefore its URL is /lessons/routing-basics/a).
// It shares the /lessons layout with its siblings, so the persistence probe
// in the header keeps its state when you navigate here.

import Link from 'next/link';

export default function SubRouteA() {
    return (
        <div className='space-y-4'>
            <span className='inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300'>
                Sub-route A
            </span>
            <h1 className='text-2xl font-bold text-white'>
                /lessons/routing-basics/a
            </h1>
            <p className='text-sm text-slate-400'>
                Guarda la pillola verde in alto a destra: il contatore non si è
                azzerato. Il layout in{' '}
                <code className='font-mono text-sky-300'>
                    app/lessons/layout.tsx
                </code>{' '}
                non è stato smontato — solo il <em>children slot</em> è
                cambiato.
            </p>
            <div className='flex flex-wrap gap-3'>
                <Link
                    href='/lessons/routing-basics'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    ← Indietro alla lezione
                </Link>
                <Link
                    href='/lessons/routing-basics/b'
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    → Vai a Sub-route B
                </Link>
            </div>
        </div>
    );
}
