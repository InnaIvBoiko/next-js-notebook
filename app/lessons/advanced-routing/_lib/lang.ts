// =============================================================================
// app/lessons/advanced-routing/_lib/lang.ts
// Tiny server-side helper: reads `nb-lang` cookie and returns a typed Lang.
// -----------------------------------------------------------------------------
// 🧠 WHY THIS EXISTS
// Lab sub-routes (dashboard, gallery, crumbs) are Server Components. They
// CANNOT use `useLang()` — that's a Client Context hook fed by the lessons'
// `<LangProvider>`. To stay localised, each Server Component reads the
// `nb-lang` cookie directly (same cookie LangProvider writes when the user
// switches language). The cookie is the contract between Client and Server.
//
// The lessons layout already does this for its own LangProvider seed —
// here we replicate the bit we need for each sub-route page.
// =============================================================================

import { cookies } from 'next/headers';
import type { Lang } from '../../../_lib/dictionaries';

export async function getLessonLang(): Promise<Lang> {
    const cookieStore = await cookies();
    const raw = cookieStore.get('nb-lang')?.value;
    return raw === 'en' || raw === 'uk' ? raw : 'it';
}
