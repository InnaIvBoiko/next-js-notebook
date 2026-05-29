// =============================================================================
// app/lessons/loading-and-errors/layout.tsx
// SHARED LAYOUT for /lessons/loading-and-errors and its three demo sub-routes.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// Same pattern as Lessons 2 and 3: this layout exists so <LangProvider> stays
// mounted across navigation between the index, /slow, /streaming, /boom.
// The language pill therefore PERSISTS — change language on the index, click
// into /streaming, and the chosen language stays.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
//
// Crucially for Lesson 4: this layout sits ABOVE every error.tsx and every
// loading.tsx in this subtree. That is why, when /boom/page.tsx throws, the
// layout (and the green "layout clicks" pill from /lessons) stay alive — the
// error.tsx fallback renders INSIDE this layout's children slot, not in place
// of it.
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function LoadingAndErrorsLayout({
    children,
}: LayoutProps<'/lessons/loading-and-errors'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
