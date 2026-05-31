// =============================================================================
// app/lessons/advanced-routing/gallery/page.tsx
// Thumbnail grid — the `children` slot of the gallery layout.
// =============================================================================

import PhotoGrid from '../_components/photo-grid';
import { content } from '../_lib/content';
import { getLessonLang } from '../_lib/lang';

export default async function GalleryPage() {
    const lang = await getLessonLang();
    const t = content[lang].subroutes.gallery;

    return (
        <div className='space-y-3'>
            <header className='space-y-2'>
                <span className='inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300'>
                    {t.badge}
                </span>
                <h1 className='text-2xl font-bold text-white'>{t.title}</h1>
                <p className='max-w-2xl text-sm leading-relaxed text-slate-400'>
                    {t.description}
                </p>
            </header>
            <PhotoGrid lang={lang} />
        </div>
    );
}
