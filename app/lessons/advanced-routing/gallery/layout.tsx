// =============================================================================
// app/lessons/advanced-routing/gallery/layout.tsx
// Gallery layout — renders the thumbnails (`children`) AND the modal slot.
// -----------------------------------------------------------------------------
// 🧠 THE ARCHITECTURE
// Two slots, two destinies:
//
//   • children = the gallery thumbnail grid (page.tsx) OR the full photo
//                page (photos/[id]/page.tsx) on direct URL navigation.
//
//   • modal    = renders the @modal slot — either the intercepted modal
//                (@modal/(..)photos/[id]/page.tsx on soft nav) or NOTHING
//                (@modal/default.tsx on direct URL / hard refresh).
//
// On SOFT navigation from a thumbnail click:
//   /gallery → /gallery/photos/3
//   children stays on the gallery grid; modal renders the intercepted modal.
//   Result: the gallery sits behind, modal sits on top.
//
// On HARD navigation (pasted URL / refresh):
//   children renders photos/[id]/page.tsx (full page).
//   modal renders default.tsx (null) → no modal overlay.
//
// 🧠 THE KEY DETAIL
// Because both slots can match simultaneously, `<>{children}{modal}</>` ALWAYS
// renders both — but the modal slot is the one that returns `null` from
// default.tsx when there's nothing to intercept. The CSS `fixed inset-0`
// inside the modal takes it out of flow.
// =============================================================================

import Link from 'next/link';
import type { ReactNode } from 'react';
import { content } from '../_lib/content';
import { getLessonLang } from '../_lib/lang';

type Props = {
    children: ReactNode;
    modal: ReactNode;
};

export default async function GalleryLayout({ children, modal }: Props) {
    const lang = await getLessonLang();
    const t = content[lang].subroutes;

    return (
        <div className='space-y-4'>
            <Link
                href='/lessons/advanced-routing'
                className='inline-block text-sm text-sky-300 hover:text-sky-200'
            >
                {t.backToLesson}
            </Link>

            {children}
            {modal}
        </div>
    );
}
