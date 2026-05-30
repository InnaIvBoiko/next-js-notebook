// =============================================================================
// app/lessons/middleware-logic/page.tsx
// SERVER entry for /lessons/middleware-logic — Module 4 · Lesson 4.
// -----------------------------------------------------------------------------
// 🧠 What the page resolves server-side BEFORE rendering:
//   • current `nb-lang` cookie value      → shown in Lab 1
//   • current `nb-demo-pass` cookie value → drives the Lab 3 gate UI
//   • injected request headers            → shown in Lab 2
//   • `?denied=1` search param            → set by the proxy when it
//                                            redirected away from /protected*
//
// All Request data (cookies/headers/searchParams) → page is implicitly
// dynamic. We wrap everything in a top-level <Suspense> + `await connection()`
// like the other dynamic lessons.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { cookies, headers } from 'next/headers';
import IndexView from './_components/index-view';
import HeadersDisplay from './_components/headers-display';
import LocaleDemo from './_components/locale-demo';
import ProtectedDemo from './_components/protected-demo';

export const metadata: Metadata = {
    title: 'Proxy (Middleware) · Living Notebook',
    description:
        'Module 4 · Lesson 4: the Next 16 proxy.ts edge-runtime handler — locale sniffing into nb-lang cookie (fixes Lessons 2 & 3 hydration), header injection for RSCs, redirect-based gating of a /protected subroute.',
};

type PageProps = { searchParams: Promise<{ denied?: string }> };

export default function MiddlewareLogicPage({ searchParams }: PageProps) {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PageContent searchParams={searchParams} />
        </Suspense>
    );
}

async function PageContent({
    searchParams,
}: {
    searchParams: Promise<{ denied?: string }>;
}) {
    // Escape hatch: makes Next treat this branch as request-time. Same
    // rationale as /lessons/database-orm + /lessons/auth-setup.
    await connection();

    const [cookieStore, headerStore, params] = await Promise.all([
        cookies(),
        headers(),
        searchParams,
    ]);

    const langCookie = cookieStore.get('nb-lang')?.value ?? null;
    const demoPassCookie = cookieStore.get('nb-demo-pass')?.value ?? null;

    const injected = {
        pathname: headerStore.get('x-pathname'),
        lang: headerStore.get('x-lang'),
        country: headerStore.get('x-geo-country'),
    };

    const wasDenied = params.denied === '1';

    return (
        <IndexView
            wasDenied={wasDenied}
            localeDemo={<LocaleDemo cookieValue={langCookie} />}
            headersDemo={<HeadersDisplay injected={injected} />}
            protectedDemo={<ProtectedDemo cookieValue={demoPassCookie} />}
        />
    );
}

function LessonSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-7 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-2/3 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}
