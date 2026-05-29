// =============================================================================
// app/lessons/caching/layout.tsx
// SHARED LAYOUT for /lessons/caching + the three demo sub-routes.
// -----------------------------------------------------------------------------
// Same pattern as Lessons 2-4 and Lesson 5: this Server layout mounts a Client
// <LangProvider> so the language pill persists across the index, /baseline,
// /cached, /react-cache.
//
// 🧠 Cache Components note: this layout does NOT read cookies/headers and
// does NOT do uncached fetches, so it does not need a <Suspense> wrap. With
// cacheComponents: true (set in next.config.ts), only layouts that touch
// per-request data need that treatment.
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function CachingLayout({
    children,
}: LayoutProps<'/lessons/caching'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
