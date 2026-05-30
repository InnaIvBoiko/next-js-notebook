'use client';
// =============================================================================
// app/lessons/database-orm/_components/empty-state.tsx
// Tiny Client island that resolves the i18n empty label.
// -----------------------------------------------------------------------------
// Used by <RscNotesList /> (a Server Component) when the DB returns zero
// rows. We extracted it so the RSC parent doesn't need 'use client' itself
// — a Server Component can render a Client Component child, but not the
// reverse.
//
// 🛑 suppressHydrationWarning here too: same reason as DeleteNoteButton.
// We live inside a streaming <Suspense> boundary; if the user switched
// language in a previous session, the server-rendered HTML and the
// client's post-useEffect state disagree. The proper fix is cookie-based
// language persistence (Module 5 · /advanced-routing).
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

export default function EmptyState() {
    const lang = useLang();
    return (
        <p
            className='rounded-md border border-dashed border-slate-700 bg-slate-900/30 px-3 py-2 text-xs text-slate-500'
            suppressHydrationWarning
        >
            {content[lang].labs.rscReader.emptyLabel}
        </p>
    );
}
