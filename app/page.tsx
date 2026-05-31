// =============================================================================
// app/page.tsx — Living Notebook HOME
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This file is a Server Component (no `'use client'`). It runs only on the
// server. Its job: read the `nb-lang` cookie (written by proxy.ts on first
// visit, by the LangBar / home switcher on user change), then render
// `<NotebookShell />` with the right `initialLang` so SSR + client agree
// from render 0 — no hydration mismatch, no flicker.
//
// 🧠 WHY READING THE COOKIE MATTERS BEYOND i18n
// Under Cache Components, calling `cookies()` opts THIS page out of static
// prerendering. That's the desired behaviour in production: proxy.ts mints
// a per-request CSP nonce and stamps it into `Content-Security-Policy`.
// Statically prerendered HTML carries no nonce on its inline scripts, so
// the browser refuses to execute them → React never hydrates → the home
// language switcher (and any other client-side state) silently breaks.
// Making the page dynamic lets Next inject the correct per-request nonce
// into the hydration scripts.
//
// 🧠 SUSPENSE WRAP — Cache Components rule
// Pages that read uncached request-time data (cookies, headers) must be
// wrapped in <Suspense> (or moved into a child that is). We use a thin
// async child here.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
// 📚 Doc: node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// =============================================================================

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import NotebookShell from './_components/notebook-shell';
import type { Lang } from './_lib/dictionaries';

export default function HomePage() {
    return (
        <Suspense fallback={null}>
            <HomeShellWithLang />
        </Suspense>
    );
}

async function HomeShellWithLang() {
    const cookieStore = await cookies();
    const raw = cookieStore.get('nb-lang')?.value;
    const initialLang: Lang = raw === 'en' || raw === 'uk' ? raw : 'it';
    return <NotebookShell initialLang={initialLang} />;
}
