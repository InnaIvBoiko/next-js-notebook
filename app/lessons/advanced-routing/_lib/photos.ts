// =============================================================================
// app/lessons/advanced-routing/_lib/photos.ts
// Mock photo data for the gallery / intercepting-route demo, with per-lang
// titles and descriptions.
// -----------------------------------------------------------------------------
// 🧠 SAME I18N MODEL AS seo-metadata/_lib/posts.ts
// `title` and `description` are `Record<Lang, string>`. Other fields are flat
// (numeric dimensions, image src — those don't translate). Call
// `localizePhoto(photo, lang)` to flatten for the current language before
// rendering.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type LocalizedString = Record<Lang, string>;

export type Photo = {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    src: string;
    width: number;
    height: number;
};

export type LocalizedPhoto = Omit<Photo, 'title' | 'description'> & {
    title: string;
    description: string;
};

export const photos: Photo[] = [
    {
        id: '1',
        title: {
            it: 'Pini nella nebbia',
            en: 'Misty pines',
            uk: 'Сосни в тумані',
        },
        description: {
            it: 'Paesaggio invernale soft-focus. Usato per dimostrare il pattern del modal intercettato: click → modal, paste URL → page intera.',
            en: 'Soft-focus winter landscape. Used to demo the intercepting modal pattern: click → modal, paste URL → full page.',
            uk: 'Soft-focus зимовий пейзаж. Для демо патерну intercepting modal: click → modal, paste URL → повна сторінка.',
        },
        src: 'https://picsum.photos/seed/nb-photo-1/1200/800',
        width: 1200,
        height: 800,
    },
    {
        id: '2',
        title: {
            it: 'Arco di arenaria',
            en: 'Sandstone arch',
            uk: 'Піщана арка',
        },
        description: {
            it: 'Toni caldi del deserto. La griglia è renderizzata server-side, il modal è uno slot parallel sopra la griglia.',
            en: 'Warm desert tones. The grid is rendered server-side, modal is a parallel-route slot above the grid.',
            uk: 'Теплі пустельні відтінки. Сітка рендериться server-side, modal — parallel-route slot над сіткою.',
        },
        src: 'https://picsum.photos/seed/nb-photo-2/1200/800',
        width: 1200,
        height: 800,
    },
    {
        id: '3',
        title: {
            it: 'Aurora',
            en: 'Aurora',
            uk: 'Полярне сяйво',
        },
        description: {
            it: "Luci polari sopra il fiordo. URL-shareable: copia l'indirizzo, apri in una nuova tab, vedi la page intera.",
            en: 'Polar lights over the fjord. URL-shareable: copy the address, open in a new tab, you get the full page.',
            uk: 'Полярне сяйво над фьордом. URL-shareable: скопіюй адресу, відкрий у новій tab, побачиш повну сторінку.',
        },
        src: 'https://picsum.photos/seed/nb-photo-3/1200/800',
        width: 1200,
        height: 800,
    },
    {
        id: '4',
        title: {
            it: 'Scogliera costiera',
            en: 'Coastal cliff',
            uk: 'Берегова скеля',
        },
        description: {
            it: 'Long exposure dell\'Atlantico. Stessa immagine della page intera — la route intercettata cambia solo la UI.',
            en: 'Long exposure of the Atlantic. Same image as the full page — the intercepting route just changes the UI.',
            uk: 'Long exposure Атлантики. Те саме зображення, що й на повній сторінці — intercepting route тільки змінює UI.',
        },
        src: 'https://picsum.photos/seed/nb-photo-4/1200/800',
        width: 1200,
        height: 800,
    },
    {
        id: '5',
        title: {
            it: 'Terrazze di riso',
            en: 'Rice terraces',
            uk: 'Рисові тераси',
        },
        description: {
            it: 'Ubud, Bali al golden hour. Ogni foto è un record nell\'array `photos` in-memory — id è il route param.',
            en: 'Ubud, Bali at golden hour. Each photo is a record in the in-memory `photos` array — id is the route param.',
            uk: 'Убуд, Балі на golden hour. Кожна фото — record в in-memory масиві `photos` — id це route param.',
        },
        src: 'https://picsum.photos/seed/nb-photo-5/1200/800',
        width: 1200,
        height: 800,
    },
    {
        id: '6',
        title: {
            it: 'Caldera vulcanica',
            en: 'Volcano caldera',
            uk: 'Кальдера вулкана',
        },
        description: {
            it: "Islanda a metà estate. Il modal si chiude con Esc, col back-button, e cliccando sul backdrop.",
            en: 'Iceland mid-summer. Modal closes on Esc, on back-button, and on clicking the backdrop.',
            uk: 'Ісландія в середині літа. Modal закривається Esc, back-button, і click на backdrop.',
        },
        src: 'https://picsum.photos/seed/nb-photo-6/1200/800',
        width: 1200,
        height: 800,
    },
];

export function localizePhoto(photo: Photo, lang: Lang): LocalizedPhoto {
    return {
        ...photo,
        title: photo.title[lang],
        description: photo.description[lang],
    };
}

export function getPhoto(id: string): Photo | null {
    return photos.find((p) => p.id === id) ?? null;
}
