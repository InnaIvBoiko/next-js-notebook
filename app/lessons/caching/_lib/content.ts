// =============================================================================
// app/lessons/caching/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /caching + demos.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type DemoCopy = {
    badge: string;
    title: string;
    description: string;
};

export type LessonContent = {
    index: {
        badge: string;
        title: string;
        intro: string;
        sections: {
            useCache: {
                heading: string;
                description: string;
                snippet: string;
            };
            cacheLife: {
                heading: string;
                description: string;
                snippet: string;
                postscript: string;
            };
            reactCache: {
                heading: string;
                description: string;
                snippet: string;
                postscript: string;
            };
            cacheKey: {
                heading: string;
                description: string;
                postscript: string;
            };
            tagInvalidation: {
                heading: string;
                description: string;
                snippet: string;
                forward: string;
            };
        };
        demosHeading: string;
        demos: {
            baseline: { label: string; route: string; description: string };
            cached: { label: string; route: string; description: string };
            reactCache: { label: string; route: string; description: string };
        };
    };
    demos: {
        baseline: DemoCopy & {
            timestampLabel: string;
            takeaway: string;
            backToIndex: string;
        };
        cached: DemoCopy & {
            uncachedLabel: string;
            cachedLabel: string;
            uncachedHint: string;
            cachedHint: string;
            takeaway: string;
            backToIndex: string;
        };
        reactCache: DemoCopy & {
            calleeLabel: string;
            takeaway: string;
            backToIndex: string;
        };
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    index: {
        badge: 'Modulo 2 · Lezione 2',
        title: 'Caching — il modello Cache Components di Next 16',
        intro: 'Nella Lezione 1 hai visto il default uncached e la memoization per-render. Qui prendiamo il passo successivo: caching tra request, persistente, controllabile. Il meccanismo si chiama Cache Components ed è attivato dal flag cacheComponents: true in next.config.ts (già configurato per te). Il direttivo `\'use cache\'` è il modo per opt-in al caching. cacheLife controlla quanto dura il valore in cache. React.cache() rimane lo strumento giusto per la memoization per-request di funzioni non-fetch.',
        sections: {
            useCache: {
                heading: '1 · `\'use cache\'` — il direttivo di opt-in',
                description:
                    'Aggiungi `\'use cache\'` all\'inizio di una funzione async, di un componente, o di un file. Il valore di ritorno viene memorizzato. Le chiamate successive con gli STESSI argomenti riusano la voce in cache invece di rieseguire la funzione. È il modello dichiarativo: tu marchi cosa è cacheable, Next gestisce il resto (chiave di cache, storage, scadenza).',
                snippet:
                    "import { cacheLife } from 'next/cache';\n\nasync function getPosts() {\n    'use cache';\n    cacheLife('hours');\n    const res = await fetch('https://api.example.com/posts');\n    return res.json();\n}\n\n// Chiamarla 100 volte di seguito = 1 sola esecuzione (finché valida).",
            },
            cacheLife: {
                heading: '2 · cacheLife — quanto dura una voce in cache',
                description:
                    'cacheLife(profile) configura tre valori: stale (cache client), revalidate (cache server), expire (mai più valida). I profili built-in vanno da seconds a weeks. Senza specificare nulla, il profilo default è 5min stale / 15min revalidate / never expire. Nei demo qui sotto usiamo "seconds" perché vuoi VEDERE la revalidation dal vivo — in produzione userai hours o days a seconda della velocità a cui i tuoi dati cambiano.',
                snippet:
                    "// Built-in profiles\ncacheLife('seconds');  // ottimo per i demo\ncacheLife('minutes');\ncacheLife('hours');    // tipico per pagine di prodotto\ncacheLife('days');\ncacheLife('weeks');    // tipico per contenuti static-ish\n",
                postscript:
                    'Puoi definire profili custom in next.config.ts via cacheLife configurando stale/revalidate/expire al millisecondo. Vedi i docs ufficiali per i dettagli.',
            },
            reactCache: {
                heading: '3 · React.cache() — memoization per-request',
                description:
                    "Diverso da `'use cache'`: React.cache() è memoization SCOPED al singolo request. Se chiami la funzione 10 volte da componenti diversi nello stesso render, la funzione esegue UNA volta, le altre 9 ricevono lo stesso valore memorizzato. Tra una request e la successiva, ricomincia da capo. È l'equivalente non-fetch della memoization automatica di fetch che hai visto in Lezione 1.",
                snippet:
                    "import { cache } from 'react';\n\nexport const getUser = cache(async (id: string) => {\n    return db.users.findUnique({ where: { id } });\n});\n\n// Chiamata 5 volte nello stesso render = 1 query al DB.\n// Tra request diverse = 5 query.",
                postscript:
                    'Usa cache() per query al database, file system, computazioni costose. Per fetch usa direttamente fetch() — la memoization è automatica.',
            },
            cacheKey: {
                heading: '4 · La chiave di cache',
                description:
                    "La chiave di una voce in cache è (a) build ID, (b) hash della firma della funzione, (c) argomenti serializzati, (d) variabili catturate dalla closure. Conseguenza pratica: `getPost(id)` con id=1 e id=2 sono entry separate. Una funzione che cattura una variabile esterna include anche quella nella chiave.",
                postscript:
                    'Vincolo importante: gli argomenti devono essere serializzabili. Non puoi passare istanze di classi, funzioni (eccetto come pass-through), URL, WeakMap, Symbol. Per cookies()/headers() devi leggerli FUORI dal blocco cached e passarli come argomento.',
            },
            tagInvalidation: {
                heading: '5 · cacheTag + revalidateTag (forward reference)',
                description:
                    "Per invalidare manualmente una voce in cache prima della sua scadenza: tagga la voce con cacheTag('tag-name'), poi chiama revalidateTag('tag-name') quando i dati sottostanti cambiano. È il pattern produzione tipico: aggiungi un prodotto → revalidateTag('products') → tutte le pagine cached che dipendono da quel tag rigenerano al prossimo accesso.",
                snippet:
                    "import { cacheTag } from 'next/cache';\n\nasync function getProducts() {\n    'use cache';\n    cacheTag('products');\n    return db.products.findAll();\n}\n\n// In una Server Action:\nasync function createProduct(data) {\n    'use server';\n    await db.products.create(data);\n    revalidateTag('products');  // ← invalidazione mirata\n}",
                forward:
                    'La demo interattiva di revalidateTag arriva nella Lezione 3 (Server Actions). Qui non possiamo dimostrarla dal vivo senza preempting quel concetto.',
            },
        },
        demosHeading: 'Tre demo dal vivo',
        demos: {
            baseline: {
                label: 'Baseline — senza cache',
                route: '/lessons/caching/baseline',
                description:
                    'Reference: una pagina async che ritorna il timestamp corrente. Niente direttivi. Cmd+R: il timestamp cambia ogni volta. È il punto di partenza per misurare cosa fa "use cache".',
            },
            cached: {
                label: 'Con `\'use cache\'` + cacheLife',
                route: '/lessons/caching/cached',
                description:
                    'Due timestamp side-by-side: uno uncached (cambia ogni Cmd+R), uno con `\'use cache\'` + cacheLife("seconds") (rimane congelato per ~1-2s, poi rigenera).',
            },
            reactCache: {
                label: 'React.cache() — memoization per render',
                route: '/lessons/caching/react-cache',
                description:
                    'Una funzione non-fetch wrapped da React.cache(), chiamata da 3 componenti server diversi nello stesso render. Tutti e 3 ricevono lo stesso valore: una sola esecuzione.',
            },
        },
    },
    demos: {
        baseline: {
            badge: 'Demo · /baseline',
            title: 'Baseline — il riferimento uncached',
            description:
                "Questa pagina async chiama getNow() (funzione locale, niente direttivi) e mostra il valore. Niente `'use cache'`, niente cacheLife: il default Next 16 è in vigore. Ogni request ri-renderizza, il timestamp cambia ogni volta.",
            timestampLabel: 'Timestamp da getNow()',
            takeaway:
                'Premi Cmd+R 5 volte: il timestamp cambia ogni volta. Niente cache attiva. È il punto zero rispetto al quale misureremo l\'effetto di `\'use cache\'`.',
            backToIndex: '← Indietro alla lezione',
        },
        cached: {
            badge: 'Demo · /cached',
            title: '`\'use cache\'` + cacheLife("seconds")',
            description:
                'Stesso schema della baseline, ma due timestamp invece di uno. A sinistra: funzione UNCACHED (cambia sempre). A destra: funzione con `\'use cache\'` + cacheLife("seconds") (rimane stabile per ~1-2s, poi rigenera). Premi Cmd+R in rapida sequenza e osserva la differenza.',
            uncachedLabel: 'UNCACHED — getUncachedNow()',
            cachedLabel: 'CACHED — getCachedNow() con `\'use cache\'`',
            uncachedHint:
                'Niente direttivo. Esegue a ogni request. Default Next 16.',
            cachedHint:
                '`\'use cache\'` + cacheLife("seconds"). Memorizzato per ~1-2s.',
            takeaway:
                "Premi Cmd+R 5 volte velocemente: il valore di sinistra cambia ogni volta; quello di destra resta uguale finché il TTL non scade (~1-2s con il profilo seconds), poi salta al valore nuovo. Quello è il caching attivo. In produzione il TTL sarebbe hours o days.",
            backToIndex: '← Indietro alla lezione',
        },
        reactCache: {
            badge: 'Demo · /react-cache',
            title: 'React.cache() — memoization per request',
            description:
                "Una funzione asincrona getNowOnce() è wrapped da React.cache(). Tre componenti server distinti la chiamano nello stesso render. Risultato: tutti e tre vedono lo STESSO valore — una sola esecuzione di getNowOnce(). Tra request diverse il valore cambia (cache() è scoped per request).",
            calleeLabel: 'Componente',
            takeaway:
                "Le tre celle qui sotto mostrano lo stesso timestamp esatto al millisecondo — prova che React.cache() ha de-duplicato le tre chiamate dentro il singolo render. Premi Cmd+R: tutte e tre cambiano insieme, ma di nuovo restano coerenti tra loro. È il pattern da usare per query al database chiamate da componenti diversi: una funzione cache()-wrapped, chiamata ovunque, eseguita una volta sola per request.",
            backToIndex: '← Indietro alla lezione',
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 2 · Lesson 2',
        title: 'Caching — the Next 16 Cache Components model',
        intro: "In Lesson 1 you saw the uncached default and per-render memoization. Here we take the next step: caching across requests, persistent, controllable. The mechanism is called Cache Components and it's enabled by the cacheComponents: true flag in next.config.ts (already configured for you). The `'use cache'` directive is how you opt into caching. cacheLife controls how long a value stays cached. React.cache() remains the right tool for per-request memoization of non-fetch functions.",
        sections: {
            useCache: {
                heading: "1 · `'use cache'` — the opt-in directive",
                description:
                    "Add `'use cache'` at the top of an async function, a component, or a file. The return value is memorized. Subsequent calls with the SAME arguments reuse the cached entry instead of re-executing the function. It is the declarative model: you mark what is cacheable, Next handles the rest (cache key, storage, expiration).",
                snippet:
                    "import { cacheLife } from 'next/cache';\n\nasync function getPosts() {\n    'use cache';\n    cacheLife('hours');\n    const res = await fetch('https://api.example.com/posts');\n    return res.json();\n}\n\n// Call it 100 times in a row = 1 execution (while still valid).",
            },
            cacheLife: {
                heading: '2 · cacheLife — how long an entry stays cached',
                description:
                    'cacheLife(profile) configures three values: stale (client cache), revalidate (server cache), expire (never valid after). Built-in profiles range from seconds to weeks. Without specifying anything, the default profile is 5min stale / 15min revalidate / never expire. In the demos below we use "seconds" because you want to SEE revalidation live — in production you would use hours or days depending on how fast your data changes.',
                snippet:
                    "// Built-in profiles\ncacheLife('seconds');  // great for demos\ncacheLife('minutes');\ncacheLife('hours');    // typical for product pages\ncacheLife('days');\ncacheLife('weeks');    // typical for static-ish content",
                postscript:
                    'You can define custom profiles in next.config.ts via cacheLife by configuring stale/revalidate/expire in milliseconds. See the official docs for details.',
            },
            reactCache: {
                heading: '3 · React.cache() — per-request memoization',
                description:
                    "Different from `'use cache'`: React.cache() is memoization SCOPED to a single request. If you call the function 10 times from different components in the same render, it runs ONCE, the other 9 receive the same memoized value. Between one request and the next, it starts fresh. It is the non-fetch equivalent of the automatic fetch memoization you saw in Lesson 1.",
                snippet:
                    "import { cache } from 'react';\n\nexport const getUser = cache(async (id: string) => {\n    return db.users.findUnique({ where: { id } });\n});\n\n// Called 5 times in the same render = 1 DB query.\n// Across different requests = 5 queries.",
                postscript:
                    'Use cache() for database queries, file system reads, expensive computations. For fetch use fetch() directly — memoization is automatic.',
            },
            cacheKey: {
                heading: '4 · The cache key',
                description:
                    'The key of a cached entry is (a) build ID, (b) hash of the function signature, (c) serialized arguments, (d) variables captured from the closure. Practical consequence: `getPost(id)` with id=1 and id=2 are separate entries. A function that captures an outer variable includes that in the key too.',
                postscript:
                    "Important constraint: arguments must be serializable. You cannot pass class instances, functions (except as pass-through), URLs, WeakMap, Symbol. For cookies()/headers() you must read them OUTSIDE the cached block and pass them as arguments.",
            },
            tagInvalidation: {
                heading: '5 · cacheTag + revalidateTag (forward reference)',
                description:
                    "To manually invalidate a cache entry before its expiration: tag the entry with cacheTag('tag-name'), then call revalidateTag('tag-name') when the underlying data changes. It is the typical production pattern: add a product → revalidateTag('products') → all cached pages depending on that tag will regenerate on next access.",
                snippet:
                    "import { cacheTag } from 'next/cache';\n\nasync function getProducts() {\n    'use cache';\n    cacheTag('products');\n    return db.products.findAll();\n}\n\n// In a Server Action:\nasync function createProduct(data) {\n    'use server';\n    await db.products.create(data);\n    revalidateTag('products');  // ← targeted invalidation\n}",
                forward:
                    'The interactive revalidateTag demo arrives in Lesson 3 (Server Actions). We cannot demonstrate it live here without preempting that concept.',
            },
        },
        demosHeading: 'Three live demos',
        demos: {
            baseline: {
                label: 'Baseline — no cache',
                route: '/lessons/caching/baseline',
                description:
                    "Reference: an async page returning the current timestamp. No directives. Cmd+R: the timestamp changes every time. The starting point for measuring what 'use cache' actually does.",
            },
            cached: {
                label: "With `'use cache'` + cacheLife",
                route: '/lessons/caching/cached',
                description:
                    "Two timestamps side-by-side: one uncached (changes every Cmd+R), one with `'use cache'` + cacheLife(\"seconds\") (stays frozen for ~1-2s, then regenerates).",
            },
            reactCache: {
                label: 'React.cache() — per-render memoization',
                route: '/lessons/caching/react-cache',
                description:
                    'A non-fetch function wrapped by React.cache(), called by 3 different server components in the same render. All 3 receive the same value: one execution.',
            },
        },
    },
    demos: {
        baseline: {
            badge: 'Demo · /baseline',
            title: 'Baseline — the uncached reference',
            description:
                "This async page calls getNow() (local function, no directives) and renders the value. No `'use cache'`, no cacheLife: the Next 16 default applies. Every request re-renders, the timestamp changes every time.",
            timestampLabel: 'Timestamp from getNow()',
            takeaway:
                "Press Cmd+R 5 times: the timestamp changes every time. No caching is active. This is the zero point against which we measure the effect of `'use cache'`.",
            backToIndex: '← Back to the lesson',
        },
        cached: {
            badge: 'Demo · /cached',
            title: "`'use cache'` + cacheLife(\"seconds\")",
            description:
                "Same skeleton as baseline, but two timestamps instead of one. Left: UNCACHED function (always changes). Right: function with `'use cache'` + cacheLife(\"seconds\") (stays stable for ~1-2s, then regenerates). Press Cmd+R in quick succession and watch the difference.",
            uncachedLabel: 'UNCACHED — getUncachedNow()',
            cachedLabel: "CACHED — getCachedNow() with `'use cache'`",
            uncachedHint:
                'No directive. Runs on every request. Next 16 default.',
            cachedHint: '`\'use cache\'` + cacheLife("seconds"). Memoized for ~1-2s.',
            takeaway:
                'Press Cmd+R 5 times quickly: the left value changes every time; the right one stays the same until the TTL expires (~1-2s with the seconds profile), then jumps to the new value. That is caching at work. In production the TTL would be hours or days.',
            backToIndex: '← Back to the lesson',
        },
        reactCache: {
            badge: 'Demo · /react-cache',
            title: 'React.cache() — per-request memoization',
            description:
                'An async function getNowOnce() is wrapped by React.cache(). Three distinct server components call it in the same render. Result: all three see the SAME value — one execution of getNowOnce(). Across different requests the value changes (cache() is request-scoped).',
            calleeLabel: 'Component',
            takeaway:
                'The three cells below show the same exact millisecond timestamp — proof that React.cache() de-duplicated the three calls within the single render. Press Cmd+R: all three change together, but again stay consistent with each other. This is the pattern to use for database queries called from different components: one cache()-wrapped function, called anywhere, executed once per request.',
            backToIndex: '← Back to the lesson',
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 2 · Лекція 2',
        title: 'Caching — модель Cache Components у Next 16',
        intro: "У Лекції 1 ти побачив uncached дефолт і per-render memoization. Тут робимо наступний крок: кешування між request-ами, persistent, контрольоване. Механізм називається Cache Components і вмикається прапором cacheComponents: true в next.config.ts (вже налаштовано). Директива `'use cache'` — спосіб opt-in у кешування. cacheLife контролює, скільки значення живе у кеші. React.cache() залишається правильним інструментом для per-request memoization не-fetch функцій.",
        sections: {
            useCache: {
                heading: "1 · `'use cache'` — opt-in директива",
                description:
                    "Додай `'use cache'` на початок async функції, компонента або файлу. Значення, що повертається, кешується. Подальші виклики з тими ж аргументами використовують запис із кешу замість повторного виконання. Це декларативна модель: ти позначаєш, що кешуємо, Next займається рештою (ключ кешу, сховище, прострочення).",
                snippet:
                    "import { cacheLife } from 'next/cache';\n\nasync function getPosts() {\n    'use cache';\n    cacheLife('hours');\n    const res = await fetch('https://api.example.com/posts');\n    return res.json();\n}\n\n// 100 викликів поспіль = 1 виконання (поки валідне).",
            },
            cacheLife: {
                heading: '2 · cacheLife — скільки живе запис у кеші',
                description:
                    'cacheLife(profile) конфігурує три значення: stale (client cache), revalidate (server cache), expire (більше не валідне після). Built-in профілі — від seconds до weeks. Без вказівки — дефолт 5хв stale / 15хв revalidate / ніколи не expire. У демо нижче — "seconds", щоб ти ПОБАЧИВ revalidation наживо. У продакшені — hours або days залежно від частоти змін даних.',
                snippet:
                    "// Built-in profiles\ncacheLife('seconds');  // чудово для demo\ncacheLife('minutes');\ncacheLife('hours');    // типово для product-сторінок\ncacheLife('days');\ncacheLife('weeks');    // типово для static-ish контенту",
                postscript:
                    'Можна визначити кастомні профілі в next.config.ts через cacheLife, конфігуруючи stale/revalidate/expire у мілісекундах. Деталі — в офіційній доці.',
            },
            reactCache: {
                heading: '3 · React.cache() — per-request memoization',
                description:
                    "Не плутати з `'use cache'`: React.cache() — memoization SCOPED одним request-ом. Якщо ти викликаєш функцію 10 разів з різних компонентів у тому ж рендері, виконається ВОДИН раз, інші 9 отримають той самий запам'ятований результат. Між різними request-ами починає з нуля. Це не-fetch еквівалент автоматичної fetch-memoization, яку ти бачив у Лекції 1.",
                snippet:
                    "import { cache } from 'react';\n\nexport const getUser = cache(async (id: string) => {\n    return db.users.findUnique({ where: { id } });\n});\n\n// 5 викликів у тому ж рендері = 1 DB запит.\n// Між різними request-ами = 5 запитів.",
                postscript:
                    'Використовуй cache() для DB запитів, file system читань, важких обчислень. Для fetch — використовуй fetch() напряму, memoization автоматична.',
            },
            cacheKey: {
                heading: '4 · Ключ кешу',
                description:
                    'Ключ запису у кеші — це (a) build ID, (b) хеш сигнатури функції, (c) серіалізовані аргументи, (d) змінні, захоплені з closure. Практичний наслідок: `getPost(id)` з id=1 і id=2 — окремі entry. Функція, що захоплює зовнішню змінну, включає її у ключ.',
                postscript:
                    "Важливе обмеження: аргументи мають бути serializable. Не можна передавати інстанси класів, функції (крім як pass-through), URL, WeakMap, Symbol. Для cookies()/headers() читай їх ПОЗА кешованим блоком і передавай як аргумент.",
            },
            tagInvalidation: {
                heading: '5 · cacheTag + revalidateTag (forward reference)',
                description:
                    "Щоб вручну інвалідувати запис у кеші до його прострочення: тегни запис cacheTag('tag-name'), потім виклич revalidateTag('tag-name'), коли базові дані змінились. Типовий production-патерн: додав продукт → revalidateTag('products') → усі cached сторінки, що залежать від тегу, регенеруються при наступному доступі.",
                snippet:
                    "import { cacheTag } from 'next/cache';\n\nasync function getProducts() {\n    'use cache';\n    cacheTag('products');\n    return db.products.findAll();\n}\n\n// У Server Action:\nasync function createProduct(data) {\n    'use server';\n    await db.products.create(data);\n    revalidateTag('products');  // ← цільова інвалідація\n}",
                forward:
                    'Інтерактивне демо revalidateTag — у Лекції 3 (Server Actions). Тут не можемо показати наживо без preempting тієї теми.',
            },
        },
        demosHeading: 'Три живі демо',
        demos: {
            baseline: {
                label: 'Baseline — без кешу',
                route: '/lessons/caching/baseline',
                description:
                    "Reference: async сторінка повертає поточний timestamp. Жодних директив. Cmd+R — timestamp змінюється щоразу. Точка відліку, щоб виміряти ефект `'use cache'`.",
            },
            cached: {
                label: "З `'use cache'` + cacheLife",
                route: '/lessons/caching/cached',
                description:
                    "Два timestamps side-by-side: один uncached (змінюється на кожен Cmd+R), один з `'use cache'` + cacheLife(\"seconds\") (зафіксований ~1-2с, потім регенерується).",
            },
            reactCache: {
                label: 'React.cache() — memoization per render',
                route: '/lessons/caching/react-cache',
                description:
                    'Не-fetch функція wrapped React.cache(), викликана з 3 різних server компонентів у тому ж рендері. Усі 3 отримують той самий результат: одне виконання.',
            },
        },
    },
    demos: {
        baseline: {
            badge: 'Demo · /baseline',
            title: 'Baseline — uncached reference',
            description:
                "Ця async сторінка викликає getNow() (локальна функція, жодних директив) і рендерить значення. Жодного `'use cache'`, жодного cacheLife: діє дефолт Next 16. Кожен request — re-render, timestamp змінюється щоразу.",
            timestampLabel: 'Timestamp із getNow()',
            takeaway:
                "Натисни Cmd+R 5 разів: timestamp змінюється щоразу. Жодного кешу. Це нуль, від якого міряємо ефект `'use cache'`.",
            backToIndex: '← Назад до лекції',
        },
        cached: {
            badge: 'Demo · /cached',
            title: "`'use cache'` + cacheLife(\"seconds\")",
            description:
                "Той самий скелет, що baseline, але два timestamps замість одного. Зліва: UNCACHED функція (завжди змінюється). Справа: функція з `'use cache'` + cacheLife(\"seconds\") (стабільна ~1-2с, потім регенерується). Натискай Cmd+R швидко поспіль і дивись на різницю.",
            uncachedLabel: 'UNCACHED — getUncachedNow()',
            cachedLabel: "CACHED — getCachedNow() з `'use cache'`",
            uncachedHint:
                'Жодної директиви. Виконується на кожен request. Дефолт Next 16.',
            cachedHint:
                '`\'use cache\'` + cacheLife("seconds"). Кешується ~1-2с.',
            takeaway:
                'Натисни Cmd+R 5 разів швидко: ліве значення змінюється щоразу; праве лишається тим самим, поки TTL не закінчиться (~1-2с з профілем seconds), потім стрибає до нового. Це робота кешу. У продакшені TTL був би hours або days.',
            backToIndex: '← Назад до лекції',
        },
        reactCache: {
            badge: 'Demo · /react-cache',
            title: 'React.cache() — memoization per request',
            description:
                'Async функція getNowOnce() обгорнута React.cache(). Три різні server компоненти викликають її у тому ж рендері. Результат: усі троє бачать ТЕ САМЕ значення — одне виконання getNowOnce(). Між різними request-ами значення змінюється (cache() — request-scoped).',
            calleeLabel: 'Компонент',
            takeaway:
                'Три клітинки нижче показують той самий timestamp з точністю до мілісекунди — доказ, що React.cache() де-дуплікувала три виклики всередині одного рендеру. Натисни Cmd+R: усі три змінюються разом, але знову стають однаковими між собою. Це патерн для DB запитів, які викликаються з різних компонентів: одна cache()-wrapped функція, викликана будь-де, виконана один раз на request.',
            backToIndex: '← Назад до лекції',
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
