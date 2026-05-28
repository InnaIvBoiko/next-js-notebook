// =============================================================================
// app/lessons/routing-basics/page.tsx — LESSON: Routing Basics & Layouts
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This file is a Server Component (no 'use client'). Its only job is to
// render the lesson content at the URL `/lessons/routing-basics`.
//
// What this lesson demonstrates:
//   1. File-system routing — every folder under `app/` that contains a
//      `page.tsx` becomes a navigable URL segment.
//   2. Shared layouts — `app/lessons/layout.tsx` wraps this page and
//      every sibling/descendant under /lessons/*.
//   3. <Link> vs <a> — prefetch + client-side transitions vs full reload.
//   4. Layout state persistence — proven by the green pill in the header.
//
// 📚 Docs:
//   node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
//   node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md
// =============================================================================

import Link from 'next/link';
import type { Metadata } from 'next';

// Page-level metadata — Next.js merges this with the root layout metadata.
// Setting `title` here overrides the title for this specific route.
export const metadata: Metadata = {
    title: 'Routing Basics · Living Notebook',
    description:
        'Modulo 1 · Lezione 2: come le cartelle in app/ diventano URL e perché i layout non si smontano.',
};

export default function RoutingBasicsPage() {
    return (
        <article className='space-y-10'>
            {/* Lesson header */}
            <header className='space-y-3'>
                <span className='inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300'>
                    Modulo 1 · Lezione 2
                </span>
                <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                    Routing Basics & Layouts
                </h1>
                <p className='max-w-2xl text-base leading-relaxed text-slate-400'>
                    Le cartelle dentro{' '}
                    <code className='font-mono text-sky-300'>app/</code>{' '}
                    diventano segmenti di URL. I file{' '}
                    <code className='font-mono text-sky-300'>page.tsx</code> e{' '}
                    <code className='font-mono text-sky-300'>layout.tsx</code>{' '}
                    hanno significati speciali: il primo crea una rotta
                    navigabile, il secondo un guscio condiviso che{' '}
                    <em>non si smonta</em> quando navighi tra rotte sorelle.
                </p>
            </header>

            {/* §1 — Mapping folder → URL */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    1 · Dalla cartella all'URL
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    Questa è la mappa di file che produce le rotte di questa
                    lezione:
                </p>
                <pre className='overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300'>
                    {`app/
├── layout.tsx                → root layout (richiesto, contiene <html>/<body>)
├── page.tsx                  → /
└── lessons/
    ├── layout.tsx            → guscio per ogni /lessons/*
    ├── _components/          → cartella privata (prefisso _) — non genera rotte
    │   └── persistence-probe.tsx
    └── routing-basics/
        ├── page.tsx          → /lessons/routing-basics
        ├── a/page.tsx        → /lessons/routing-basics/a
        └── b/page.tsx        → /lessons/routing-basics/b`}
                </pre>
                <p className='text-sm leading-relaxed text-slate-400'>
                    Solo le cartelle che contengono{' '}
                    <code className='font-mono text-sky-300'>page.tsx</code>{' '}
                    diventano rotte pubbliche. Le cartelle con prefisso{' '}
                    <code className='font-mono text-sky-300'>_</code> sono{' '}
                    <strong>private folders</strong>: utilità, componenti, dati
                    — Next.js le ignora come potenziali URL.
                </p>
            </section>

            {/* §2 — Layouts persistence (live demo) */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    2 · Il layout persiste (prova interattiva)
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    In alto a destra c'è la pillola verde{' '}
                    <code className='font-mono text-sky-300'>layout clicks</code>:
                    vive dentro{' '}
                    <code className='font-mono text-sky-300'>
                        app/lessons/layout.tsx
                    </code>
                    . Clicca un paio di volte, poi usa i link qui sotto: il
                    valore <strong>non si azzera</strong> perché il layout non
                    viene smontato — solo il <em>children slot</em> viene
                    sostituito.
                </p>
                <div className='flex flex-wrap gap-3'>
                    <Link
                        href='/lessons/routing-basics/a'
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                    >
                        → Sub-route A
                    </Link>
                    <Link
                        href='/lessons/routing-basics/b'
                        className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                    >
                        → Sub-route B
                    </Link>
                </div>
            </section>

            {/* §3 — Link vs <a> */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    3 ·{' '}
                    <code className='font-mono text-sky-300'>
                        &lt;Link&gt;
                    </code>{' '}
                    vs{' '}
                    <code className='font-mono text-sky-300'>&lt;a&gt;</code>
                </h2>
                <p className='text-sm leading-relaxed text-slate-400'>
                    Sembrano uguali, sono profondamente diversi.{' '}
                    <code className='font-mono text-sky-300'>
                        &lt;Link&gt;
                    </code>{' '}
                    di{' '}
                    <code className='font-mono text-sky-300'>next/link</code>{' '}
                    fa due cose extra: (1) <strong>prefetch</strong> automatico
                    della rotta destinazione quando il link entra nel viewport
                    o quando ci passi sopra col mouse; (2){' '}
                    <strong>client-side transition</strong> — niente reload,
                    niente JS re-parse, niente perdita di stato.
                </p>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4'>
                        <p className='mb-2 text-xs font-semibold tracking-wide text-emerald-300 uppercase'>
                            ✓ Buono — &lt;Link&gt;
                        </p>
                        <Link
                            href='/'
                            className='inline-block rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-400'
                        >
                            Torna alla home
                        </Link>
                        <p className='mt-2 text-xs text-slate-400'>
                            Transizione SPA. Il bundle JS resta in memoria.
                        </p>
                    </div>
                    <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4'>
                        <p className='mb-2 text-xs font-semibold tracking-wide text-amber-300 uppercase'>
                            ✗ Cattivo — &lt;a&gt;
                        </p>
                        <a
                            href='/'
                            className='inline-block rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-400'
                        >
                            Torna alla home
                        </a>
                        <p className='mt-2 text-xs text-slate-400'>
                            Full page reload. Tutto viene ricaricato.
                        </p>
                    </div>
                </div>
            </section>

            {/* §4 — Special files cheatsheet */}
            <section className='space-y-3'>
                <h2 className='text-xl font-semibold text-slate-100'>
                    4 · I file speciali del Modulo 1
                </h2>
                <ul className='space-y-2 text-sm text-slate-300'>
                    <li>
                        <code className='font-mono text-sky-300'>
                            page.tsx
                        </code>{' '}
                        — la UI di una rotta navigabile.
                    </li>
                    <li>
                        <code className='font-mono text-sky-300'>
                            layout.tsx
                        </code>{' '}
                        — guscio condiviso, persiste tra navigazioni sorelle.
                    </li>
                    <li>
                        <code className='font-mono text-sky-300'>
                            loading.tsx
                        </code>{' '}
                        — fallback in streaming (Lezione 4).
                    </li>
                    <li>
                        <code className='font-mono text-sky-300'>
                            error.tsx
                        </code>{' '}
                        — error boundary di route (Lezione 4).
                    </li>
                    <li>
                        <code className='font-mono text-sky-300'>
                            not-found.tsx
                        </code>{' '}
                        — UI 404 di segmento.
                    </li>
                    <li>
                        <code className='font-mono text-sky-300'>
                            [param]/
                        </code>{' '}
                        — dynamic segment (Lezione 3).
                    </li>
                </ul>
            </section>
        </article>
    );
}
