// =============================================================================
// app/lessons/action-pending/layout.tsx
// SHARED LAYOUT for /lessons/action-pending and its three demo sub-routes.
// =============================================================================

import LangProvider from './_components/lang-provider';
import LangBar from './_components/lang-bar';

export default function ActionPendingLayout({
    children,
}: LayoutProps<'/lessons/action-pending'>) {
    return (
        <LangProvider>
            <div className='space-y-6'>
                <LangBar />
                {children}
            </div>
        </LangProvider>
    );
}
