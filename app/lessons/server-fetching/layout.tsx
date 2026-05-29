// =============================================================================
// app/lessons/server-fetching/layout.tsx
// SHARED LAYOUT for /lessons/server-fetching and its three demo sub-routes.
// -----------------------------------------------------------------------------
// Same pattern as Lessons 2-4: this Server layout mounts a Client
// <LangProvider> so the language pill persists across the index and the
// /default, /parallel, /dynamic sub-routes.
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function ServerFetchingLayout({
    children,
}: LayoutProps<'/lessons/server-fetching'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
