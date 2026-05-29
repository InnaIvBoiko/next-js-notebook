// =============================================================================
// app/lessons/dynamic-routes/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /dynamic-routes + [id].
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

export type LessonContent = {
    index: {
        badge: string;
        title: string;
        intro: string;
        sections: {
            convention: {
                heading: string;
                description: string;
                postscript: string;
            };
            paramsPromise: {
                heading: string;
                description: string;
                serverNote: string;
                clientNote: string;
            };
            staticParams: {
                heading: string;
                description: string;
                postscript: string;
            };
            notFound: {
                heading: string;
                description: string;
                tryValid: string;
                tryInvalid: string;
            };
        };
        listHeading: string;
        listSynopsisLabel: string;
        viewItem: string;
    };
    detail: {
        backToList: string;
        urlLabel: string;
        paramsLabel: string;
        synopsisHeading: string;
        bodyHeading: string;
        prevLabel: string;
        nextLabel: string;
    };
    notFoundPage: {
        badge: string;
        title: string;
        description: string;
        backToList: string;
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    index: {
        badge: 'Modulo 1 · Lezione 3',
        title: 'Dynamic Routes — il segmento [id]',
        intro: 'Una cartella avvolta tra parentesi quadre, [id], diventa un segmento dinamico: la rotta matcha qualunque valore in quella posizione dell\'URL e te lo consegna come params. Sotto la superficie ci sono tre meccanismi che vanno capiti insieme — la Promise di params, generateStaticParams, e notFound(). Sono ciò che separa una rotta giocattolo da un dettaglio prodotto in produzione.',
        sections: {
            convention: {
                heading: '1 · La convenzione [folderName]',
                description:
                    "Una cartella si trasforma in segmento dinamico semplicemente avvolgendone il nome tra parentesi quadre. Il nome dentro le parentesi diventa la chiave nell'oggetto params. Esempio: la cartella app/lessons/dynamic-routes/[id]/ matcha /lessons/dynamic-routes/qualsiasi-cosa e te lo passa come params.id.",
                postscript:
                    'Esistono anche varianti più potenti — [...slug] (catch-all) e [[...slug]] (optional catch-all) — ma il loro caso d\'uso (slug arbitrari multi-segmento) è raro e lo vedremo nel modulo 5 (/advanced-routing).',
            },
            paramsPromise: {
                heading: '2 · params è una Promise (Next.js 16)',
                description:
                    "Breaking change rispetto a tutorial vecchi: dalla versione 15 in poi params è una Promise. Devi awaittarla in un Server Component o usare React.use(params) in un Client Component. Il motivo è che Next può iniziare a renderizzare il guscio della pagina prima ancora che i parametri di rotta siano risolti, abilitando lo streaming più precoce.",
                serverNote:
                    'Sul server (default): export default async function Page({ params }: PageProps<"/dynamic-routes/[id]">) { const { id } = await params; ... }',
                clientNote:
                    "Sul client ('use client'): const { id } = use(params); — la stessa Promise letta con il hook React `use`.",
            },
            staticParams: {
                heading: '3 · generateStaticParams — il cuore architetturale',
                description:
                    "Esportare generateStaticParams() dalla pagina dice a Next quali valori di [id] sono noti al momento della build. Per ciascuno di essi Next prerenderizza un file HTML statico durante next build. Le richieste a quegli URL servono il file pronto, senza eseguire mai più il componente. Questa lezione esporta { id } per tutti e 4 gli items: provando next build vedrai un log una sola volta per id, dopodiché silenzio.",
                postscript:
                    "Varianti production-grade: (a) NIENTE generateStaticParams → rendering on-demand a ogni request; (b) PARZIALE → prerenderizzi i top sellers, il resto on-demand (ISR-style); (c) export const dynamicParams = false → tutto ciò che non è elencato risponde 404. La scelta dipende dalla cardinalità e dalla frequenza di cambio.",
            },
            notFound: {
                heading: '4 · notFound() + segment not-found.tsx',
                description:
                    'Quando ricevi un [id] che non esiste, NON renderizzare un finto stato vuoto: chiama notFound() da next/navigation. Quella chiamata interrompe il rendering e cerca il not-found.tsx più vicino nell\'albero dei segmenti, renderizzando quello come UI 404 — con il giusto status code HTTP 404. Prova a cliccare sull\'esempio invalido qui sotto per vederlo in azione.',
                tryValid: '→ /dynamic-routes/1 (valido)',
                tryInvalid: '→ /dynamic-routes/999 (innesca notFound)',
            },
        },
        listHeading: 'Gli items del nostro mini-database',
        listSynopsisLabel: 'sinossi',
        viewItem: 'Apri',
    },
    detail: {
        backToList: '← Indietro alla lista',
        urlLabel: 'URL',
        paramsLabel: 'params',
        synopsisHeading: 'Sinossi',
        bodyHeading: 'Approfondimento',
        prevLabel: '← Precedente',
        nextLabel: 'Successivo →',
    },
    notFoundPage: {
        badge: '404 · segmento [id]',
        title: 'Nessun item con questo id',
        description:
            "Hai colpito il caso 'item non esiste'. Questa UI viene dal file not-found.tsx accanto a [id]/page.tsx, attivato dalla chiamata notFound() nella pagina quando findItem(id) restituisce undefined. Lo status HTTP è 404 (controllalo nel tab Network).",
        backToList: '← Torna alla lista',
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 1 · Lesson 3',
        title: 'Dynamic Routes — the [id] segment',
        intro: "A folder wrapped in square brackets, [id], becomes a dynamic segment: the route matches any value in that URL position and hands it to you as params. Under the surface there are three mechanisms you need to understand together — the params Promise, generateStaticParams, and notFound(). They separate a toy route from a production product detail page.",
        sections: {
            convention: {
                heading: '1 · The [folderName] convention',
                description:
                    'A folder turns into a dynamic segment simply by wrapping its name in square brackets. The name inside the brackets becomes the key in the params object. Example: the folder app/lessons/dynamic-routes/[id]/ matches /lessons/dynamic-routes/anything and gives it back to you as params.id.',
                postscript:
                    'There are also more powerful variants — [...slug] (catch-all) and [[...slug]] (optional catch-all) — but their use case (arbitrary multi-segment slugs) is rare and we will cover it in module 5 (/advanced-routing).',
            },
            paramsPromise: {
                heading: '2 · params is a Promise (Next.js 16)',
                description:
                    "Breaking change vs old tutorials: from version 15 onwards params is a Promise. You must await it in a Server Component or call React.use(params) in a Client Component. The reason: Next can start rendering the page shell before the route params are resolved, enabling earlier streaming.",
                serverNote:
                    'On the server (default): export default async function Page({ params }: PageProps<"/dynamic-routes/[id]">) { const { id } = await params; ... }',
                clientNote:
                    "On the client ('use client'): const { id } = use(params); — the same Promise read via React's `use` hook.",
            },
            staticParams: {
                heading: '3 · generateStaticParams — the architectural core',
                description:
                    "Exporting generateStaticParams() from the page tells Next which [id] values are known at build time. For each of them Next prerenders a static HTML file during next build. Requests to those URLs serve the ready file, never re-running the component. This lesson exports { id } for all 4 items: run next build and you'll see one log per id, then silence.",
                postscript:
                    'Production-grade variants: (a) NO generateStaticParams → on-demand rendering on every request; (b) PARTIAL → prerender the top sellers, the rest on-demand (ISR-style); (c) export const dynamicParams = false → everything not listed responds 404. The choice depends on cardinality and how often things change.',
            },
            notFound: {
                heading: '4 · notFound() + segment not-found.tsx',
                description:
                    'When you get an [id] that does not exist, DO NOT render a fake empty state: call notFound() from next/navigation. That call halts rendering and looks up the closest not-found.tsx in the segment tree, rendering it as the 404 UI — with the correct HTTP 404 status code. Click the invalid example below to see it in action.',
                tryValid: '→ /dynamic-routes/1 (valid)',
                tryInvalid: '→ /dynamic-routes/999 (triggers notFound)',
            },
        },
        listHeading: 'The items in our mini-database',
        listSynopsisLabel: 'synopsis',
        viewItem: 'Open',
    },
    detail: {
        backToList: '← Back to the list',
        urlLabel: 'URL',
        paramsLabel: 'params',
        synopsisHeading: 'Synopsis',
        bodyHeading: 'Deep dive',
        prevLabel: '← Previous',
        nextLabel: 'Next →',
    },
    notFoundPage: {
        badge: '404 · [id] segment',
        title: 'No item with this id',
        description:
            "You've hit the 'item does not exist' case. This UI comes from the not-found.tsx file next to [id]/page.tsx, triggered by the notFound() call in the page when findItem(id) returns undefined. The HTTP status is 404 (check the Network tab).",
        backToList: '← Back to the list',
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 1 · Лекція 3',
        title: 'Dynamic Routes — сегмент [id]',
        intro: 'Папка, ім\'я якої обгорнуто у квадратні дужки, [id], стає динамічним сегментом: маршрут матчить будь-яке значення в цій позиції URL і передає його як params. Під поверхнею — три механізми, які треба зрозуміти разом: Promise params, generateStaticParams і notFound(). Саме вони відділяють іграшковий маршрут від production-сторінки товару.',
        sections: {
            convention: {
                heading: '1 · Конвенція [folderName]',
                description:
                    "Папка перетворюється на динамічний сегмент просто обгортанням імені у квадратні дужки. Ім'я всередині дужок стає ключем у об'єкті params. Приклад: папка app/lessons/dynamic-routes/[id]/ матчить /lessons/dynamic-routes/будь-що і повертає це як params.id.",
                postscript:
                    'Є також потужніші варіанти — [...slug] (catch-all) і [[...slug]] (optional catch-all) — але їх кейс (довільні multi-segment slug-и) рідкісний, і ми розглянемо їх у модулі 5 (/advanced-routing).',
            },
            paramsPromise: {
                heading: '2 · params — це Promise (Next.js 16)',
                description:
                    'Breaking change порівняно зі старими туторіалами: починаючи з версії 15, params — це Promise. Треба await\'ити її у Server Component або викликати React.use(params) у Client Component. Причина: Next може почати рендерити оболонку сторінки ще до того, як параметри маршруту резолвнуться, — це вмикає ранніший стрімінг.',
                serverNote:
                    'На сервері (default): export default async function Page({ params }: PageProps<"/dynamic-routes/[id]">) { const { id } = await params; ... }',
                clientNote:
                    "На клієнті ('use client'): const { id } = use(params); — та сама Promise, прочитана через хук React `use`.",
            },
            staticParams: {
                heading: '3 · generateStaticParams — архітектурне ядро',
                description:
                    "Експорт generateStaticParams() зі сторінки каже Next, які значення [id] відомі на момент збірки. Для кожного з них Next prerendery статичний HTML під час next build. Запити на ці URL віддають готовий файл — компонент більше ніколи не виконується. Ця лекція експортує { id } для всіх 4 items: запусти next build і побачиш один log на id, потім тишу.",
                postscript:
                    'Production-варіанти: (a) БЕЗ generateStaticParams → on-demand рендеринг на кожен запит; (b) ЧАСТКОВО → prerender топ-продажів, решта on-demand (ISR-стиль); (c) export const dynamicParams = false → усе, що не у списку, віддає 404. Вибір залежить від кардинальності і частоти змін.',
            },
            notFound: {
                heading: '4 · notFound() + сегментний not-found.tsx',
                description:
                    "Коли отримуєш [id], якого не існує, НЕ рендери фейковий порожній стан: виклич notFound() з next/navigation. Цей виклик зупиняє рендеринг і шукає найближчий not-found.tsx у дереві сегментів — рендерить його як 404 UI з правильним HTTP-статусом 404. Клікни на невалідний приклад нижче, щоб побачити це у дії.",
                tryValid: '→ /dynamic-routes/1 (валідний)',
                tryInvalid: '→ /dynamic-routes/999 (тригерить notFound)',
            },
        },
        listHeading: 'Items нашої міні-бази',
        listSynopsisLabel: 'синопсис',
        viewItem: 'Відкрити',
    },
    detail: {
        backToList: '← Назад до списку',
        urlLabel: 'URL',
        paramsLabel: 'params',
        synopsisHeading: 'Синопсис',
        bodyHeading: 'Деталізація',
        prevLabel: '← Попередній',
        nextLabel: 'Наступний →',
    },
    notFoundPage: {
        badge: '404 · сегмент [id]',
        title: 'Немає item з таким id',
        description:
            "Ти потрапив у кейс 'item не існує'. Цей UI приходить з файлу not-found.tsx поряд із [id]/page.tsx — його активує виклик notFound() у сторінці, коли findItem(id) повертає undefined. HTTP-статус — 404 (перевір у вкладці Network).",
        backToList: '← Назад до списку',
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
