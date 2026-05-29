// =============================================================================
// app/lessons/routing-basics/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /routing-basics + sub-routes.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

export type LessonContent = {
    main: {
        badge: string;
        title: string;
        intro: string;
        sections: {
            mapping: {
                heading: string;
                description: string;
                postscript: string;
            };
            persistence: {
                heading: string;
                description: string;
                goToA: string;
                goToB: string;
            };
            linkVsAnchor: {
                heading: string;
                description: string;
                goodLabel: string;
                goodCta: string;
                goodNote: string;
                badLabel: string;
                badCta: string;
                badNote: string;
            };
            specialFiles: {
                heading: string;
                items: { code: string; description: string }[];
            };
        };
    };
    subRoutes: {
        a: SubRouteContent;
        b: SubRouteContent;
    };
};

type SubRouteContent = {
    badge: string;
    url: string;
    description: string;
    backToLesson: string;
    goToOther: string;
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    main: {
        badge: 'Modulo 1 · Lezione 2',
        title: 'Routing Basics & Layouts',
        intro: 'Le cartelle dentro app/ diventano segmenti di URL. I file page.tsx e layout.tsx hanno significati speciali: il primo crea una rotta navigabile, il secondo un guscio condiviso che NON si smonta quando navighi tra rotte sorelle.',
        sections: {
            mapping: {
                heading: "1 · Dalla cartella all'URL",
                description:
                    'Questa è la mappa di file che produce le rotte di questa lezione:',
                postscript:
                    'Solo le cartelle che contengono page.tsx diventano rotte pubbliche. Le cartelle con prefisso _ sono private folders: utilità, componenti, dati — Next.js le ignora come potenziali URL.',
            },
            persistence: {
                heading: '2 · Il layout persiste (prova interattiva)',
                description:
                    'In alto c\'è la pillola verde "layout clicks" del laboratorio: vive in app/lessons/layout.tsx. La pillola lingua, invece, vive in app/lessons/routing-basics/layout.tsx. Naviga tra le sub-routes qui sotto: entrambe persistono perché i layout NON si smontano. Cambia anche lingua, poi vai a Sub-route A: la lingua resta.',
                goToA: '→ Sub-route A',
                goToB: '→ Sub-route B',
            },
            linkVsAnchor: {
                heading: '3 · <Link> vs <a>',
                description:
                    'Sembrano uguali, sono profondamente diversi. <Link> di next/link fa due cose extra: (1) prefetch automatico della rotta destinazione quando il link entra nel viewport o quando ci passi sopra col mouse; (2) client-side transition — niente reload, niente JS re-parse, niente perdita di stato.',
                goodLabel: '✓ Buono — <Link>',
                goodCta: 'Torna alla home',
                goodNote: 'Transizione SPA. Il bundle JS resta in memoria.',
                badLabel: '✗ Cattivo — <a>',
                badCta: 'Torna alla home',
                badNote: 'Full page reload. Tutto viene ricaricato.',
            },
            specialFiles: {
                heading: '4 · I file speciali del Modulo 1',
                items: [
                    {
                        code: 'page.tsx',
                        description: 'la UI di una rotta navigabile.',
                    },
                    {
                        code: 'layout.tsx',
                        description:
                            'guscio condiviso, persiste tra navigazioni sorelle.',
                    },
                    {
                        code: 'loading.tsx',
                        description: 'fallback in streaming (Lezione 4).',
                    },
                    {
                        code: 'error.tsx',
                        description: 'error boundary di route (Lezione 4).',
                    },
                    {
                        code: 'not-found.tsx',
                        description: 'UI 404 di segmento.',
                    },
                    {
                        code: '[param]/',
                        description: 'dynamic segment (Lezione 3).',
                    },
                ],
            },
        },
    },
    subRoutes: {
        a: {
            badge: 'Sub-route A',
            url: '/lessons/routing-basics/a',
            description:
                "Guarda la pillola verde in alto a sinistra (clicks del layout /lessons) E la pillola lingua qui sopra (state del layout /routing-basics): nessuna delle due si è azzerata. Entrambi i layout non sono stati smontati — solo il children slot è cambiato.",
            backToLesson: '← Indietro alla lezione',
            goToOther: '→ Vai a Sub-route B',
        },
        b: {
            badge: 'Sub-route B',
            url: '/lessons/routing-basics/b',
            description:
                "Stesso layout di /a e della lezione principale. Apri la console di rete prima di navigare verso /a: vedrai un prefetch automatico — Next ha già scaricato il payload della rotta perché il link è entrato nel viewport.",
            backToLesson: '← Indietro alla lezione',
            goToOther: '→ Vai a Sub-route A',
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    main: {
        badge: 'Module 1 · Lesson 2',
        title: 'Routing Basics & Layouts',
        intro: 'Folders under app/ become URL segments. The files page.tsx and layout.tsx have special meanings: the first creates a navigable route, the second a shared shell that DOES NOT unmount when you navigate between sibling routes.',
        sections: {
            mapping: {
                heading: '1 · From folder to URL',
                description:
                    'This is the file map that produces the routes of this lesson:',
                postscript:
                    'Only folders containing page.tsx become public routes. Folders with the _ prefix are private folders: utilities, components, data — Next.js ignores them as potential URLs.',
            },
            persistence: {
                heading: '2 · The layout persists (interactive proof)',
                description:
                    'At the top there is the green "layout clicks" pill from the lab: it lives in app/lessons/layout.tsx. The language pill, instead, lives in app/lessons/routing-basics/layout.tsx. Navigate the sub-routes below: both persist because layouts DO NOT unmount. Change the language too, then go to Sub-route A: the language stays.',
                goToA: '→ Sub-route A',
                goToB: '→ Sub-route B',
            },
            linkVsAnchor: {
                heading: '3 · <Link> vs <a>',
                description:
                    'They look the same, they are deeply different. <Link> from next/link does two extra things: (1) automatic prefetch of the destination route when the link enters the viewport or when you hover it; (2) client-side transition — no reload, no JS re-parse, no state loss.',
                goodLabel: '✓ Good — <Link>',
                goodCta: 'Back to home',
                goodNote: 'SPA transition. The JS bundle stays in memory.',
                badLabel: '✗ Bad — <a>',
                badCta: 'Back to home',
                badNote: 'Full page reload. Everything is reloaded.',
            },
            specialFiles: {
                heading: '4 · Module 1 special files',
                items: [
                    {
                        code: 'page.tsx',
                        description: 'the UI of a navigable route.',
                    },
                    {
                        code: 'layout.tsx',
                        description:
                            'shared shell, persists across sibling navigations.',
                    },
                    {
                        code: 'loading.tsx',
                        description: 'streaming fallback (Lesson 4).',
                    },
                    {
                        code: 'error.tsx',
                        description: 'route error boundary (Lesson 4).',
                    },
                    {
                        code: 'not-found.tsx',
                        description: 'segment 404 UI.',
                    },
                    {
                        code: '[param]/',
                        description: 'dynamic segment (Lesson 3).',
                    },
                ],
            },
        },
    },
    subRoutes: {
        a: {
            badge: 'Sub-route A',
            url: '/lessons/routing-basics/a',
            description:
                'Look at the green pill in the top left (clicks of the /lessons layout) AND the language pill above (state of the /routing-basics layout): neither got reset. Both layouts have not been unmounted — only the children slot changed.',
            backToLesson: '← Back to the lesson',
            goToOther: '→ Go to Sub-route B',
        },
        b: {
            badge: 'Sub-route B',
            url: '/lessons/routing-basics/b',
            description:
                'Same layout as /a and as the main lesson. Open the network console before navigating to /a: you will see an automatic prefetch — Next has already downloaded the route payload because the link entered the viewport.',
            backToLesson: '← Back to the lesson',
            goToOther: '→ Go to Sub-route A',
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    main: {
        badge: 'Модуль 1 · Лекція 2',
        title: 'Routing Basics & Layouts',
        intro: 'Папки всередині app/ стають сегментами URL. Файли page.tsx і layout.tsx мають особливе значення: перший створює навігований маршрут, другий — спільну оболонку, яка НЕ демонтується при навігації між сусідніми маршрутами.',
        sections: {
            mapping: {
                heading: '1 · Від папки до URL',
                description:
                    'Це карта файлів, яка створює маршрути цієї лекції:',
                postscript:
                    "Лише папки, що містять page.tsx, стають публічними маршрутами. Папки з префіксом _ — це private folders: утиліти, компоненти, дані — Next.js ігнорує їх як потенційні URL'и.",
            },
            persistence: {
                heading: '2 · Layout залишається (інтерактивна перевірка)',
                description:
                    'Зверху є зелена пігулка "layout clicks" з лабораторії: вона живе в app/lessons/layout.tsx. Пігулка мови, натомість, живе в app/lessons/routing-basics/layout.tsx. Перейди між sub-routes нижче: обидві зберігаються, бо layout НЕ демонтуються. Зміни також мову, потім перейди на Sub-route A: мова залишається.',
                goToA: '→ Sub-route A',
                goToB: '→ Sub-route B',
            },
            linkVsAnchor: {
                heading: '3 · <Link> vs <a>',
                description:
                    'Виглядають однаково, відрізняються глибоко. <Link> з next/link робить дві додаткові речі: (1) автоматичний prefetch цільового маршруту, коли посилання входить у viewport або при наведенні мишею; (2) client-side transition — без reload, без re-parse JS, без втрати стану.',
                goodLabel: '✓ Добре — <Link>',
                goodCta: 'На головну',
                goodNote: 'SPA-перехід. JS-бандл залишається в памʼяті.',
                badLabel: '✗ Погано — <a>',
                badCta: 'На головну',
                badNote: 'Full page reload. Все перезавантажується.',
            },
            specialFiles: {
                heading: '4 · Спеціальні файли Модуля 1',
                items: [
                    {
                        code: 'page.tsx',
                        description: 'UI навігованого маршруту.',
                    },
                    {
                        code: 'layout.tsx',
                        description:
                            'спільна оболонка, зберігається при навігації між сусідами.',
                    },
                    {
                        code: 'loading.tsx',
                        description: 'streaming fallback (Лекція 4).',
                    },
                    {
                        code: 'error.tsx',
                        description: 'error boundary маршруту (Лекція 4).',
                    },
                    {
                        code: 'not-found.tsx',
                        description: '404 UI сегмента.',
                    },
                    {
                        code: '[param]/',
                        description: 'dynamic segment (Лекція 3).',
                    },
                ],
            },
        },
    },
    subRoutes: {
        a: {
            badge: 'Sub-route A',
            url: '/lessons/routing-basics/a',
            description:
                'Подивись на зелену пігулку зверху-зліва (кліки layout /lessons) І на пігулку мови вище (state layout /routing-basics): жодна не скинулась. Обидва layout не були демонтовані — змінився лише слот children.',
            backToLesson: '← Назад до лекції',
            goToOther: '→ До Sub-route B',
        },
        b: {
            badge: 'Sub-route B',
            url: '/lessons/routing-basics/b',
            description:
                "Той самий layout, що в /a і в головній лекції. Відкрий network console перед переходом на /a: побачиш автоматичний prefetch — Next вже завантажив payload маршруту, бо посилання увійшло в viewport.",
            backToLesson: '← Назад до лекції',
            goToOther: '→ До Sub-route A',
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
