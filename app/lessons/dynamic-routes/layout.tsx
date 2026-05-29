// =============================================================================
// app/lessons/dynamic-routes/layout.tsx
// SHARED LAYOUT for /lessons/dynamic-routes + [id] subtree
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// Same pattern as Lesson 2: this layout exists so that <LangProvider> stays
// mounted across navigations between the list (/dynamic-routes) and any
// detail (/dynamic-routes/1, /dynamic-routes/2, ...). The language pill state
// therefore PERSISTS — you can switch language on the list and click into a
// detail, and the chosen language survives.
//
// This file itself is a SERVER COMPONENT (no 'use client'): it only assembles
// markup around a Client provider boundary. The detail page below it is ALSO
// a Server Component — it can sit inside <LangProvider> as `children` because
// providers can wrap Server children. The Client hooks (useLessonLang) are
// only called from <DetailView>, which is the Client island the Server page
// renders.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function DynamicRoutesLayout({
    children,
}: LayoutProps<'/lessons/dynamic-routes'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
