// =============================================================================
// app/lessons/routing-basics/layout.tsx
// SHARED LAYOUT for /lessons/routing-basics + /a + /b
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This layout exists for ONE meta-pedagogical reason: it survives navigation
// between the lesson page and its sub-routes. Whatever state lives inside it
// also survives. We put the lesson's language state here, via the
// <LangProvider> Client island, so switching language on the main lesson
// and then clicking → Sub-route A keeps the language unchanged.
//
// The layout file itself is a SERVER COMPONENT. It only assembles a small
// markup wrapper around a Client provider (the boundary is the import of
// <LangProvider>, which is a 'use client' module). This is the production
// pattern for cross-route state without losing RSC for the markup.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function RoutingBasicsLayout({
    children,
}: LayoutProps<'/lessons/routing-basics'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
