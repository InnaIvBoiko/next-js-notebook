// =============================================================================
// app/lessons/server-actions/layout.tsx
// SHARED LAYOUT for /lessons/server-actions and its three demo sub-routes.
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function ServerActionsLayout({
    children,
}: LayoutProps<'/lessons/server-actions'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
