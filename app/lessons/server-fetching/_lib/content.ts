// =============================================================================
// app/lessons/server-fetching/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /server-fetching + demos.
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
            asyncRsc: {
                heading: string;
                description: string;
                snippet: string;
            };
            defaultUncached: {
                heading: string;
                description: string;
                postscript: string;
            };
            memoization: {
                heading: string;
                description: string;
                postscript: string;
            };
            dynamic: {
                heading: string;
                description: string;
                postscript: string;
            };
        };
        demosHeading: string;
        demos: {
            default: { label: string; route: string; description: string };
            parallel: { label: string; route: string; description: string };
            dynamic: { label: string; route: string; description: string };
        };
        cachingForward: string;
    };
    demos: {
        default: DemoCopy & {
            firstFetchLabel: string;
            secondFetchLabel: string;
            memoizationProof: string;
            backToIndex: string;
            apiLabel: string;
            refreshHint: string;
        };
        parallel: DemoCopy & {
            sequentialLabel: string;
            parallelLabel: string;
            sequentialBody: string;
            parallelBody: string;
            elapsedLabel: string;
            usersLabel: string;
            postsLabel: string;
            backToIndex: string;
        };
        dynamic: DemoCopy & {
            cookiesLabel: string;
            headersLabel: string;
            serverTimeLabel: string;
            noCookies: string;
            setCookieLabel: string;
            clearCookieLabel: string;
            cookieInstructions: string;
            backToIndex: string;
        };
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    index: {
        badge: 'Modulo 2 · Lezione 1',
        title: 'Server Fetching — recuperare dati lato server',
        intro: 'Negli RSC (React Server Components) puoi recuperare dati direttamente con await: niente useEffect, niente useState, niente API route nel mezzo. La pagina è un async function che gira sul server. Questa lezione mostra il modello di default di Next 16: fetch NON cachato, memoization automatica per render, sequenziale vs parallelo, e come cookies()/headers() rendono dinamica una rotta.',
        sections: {
            asyncRsc: {
                heading: '1 · async Server Component + await fetch',
                description:
                    'Il pattern fondante: la pagina è async, fetch ritorna una Promise, la awaiti. Tutto succede sul server: la chiamata fetch non passa per il browser, non vedi /api/posts nella tab Network — vedi solo il documento HTML che torna già renderizzato con i dati dentro.',
                snippet:
                    "export default async function Page() {\n    const res = await fetch('https://api.example.com/posts');\n    const posts = await res.json();\n    return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}",
            },
            defaultUncached: {
                heading: '2 · Default di Next 16: fetch NON cachato',
                description:
                    "Breaking change vs Next 14: dalla versione 15 in poi, fetch() in un Server Component NON è cachato di default. Ogni request renderizza la pagina e ogni await fetch fa una nuova chiamata di rete. È il comportamento più sicuro (i dati sono sempre freschi) ma non sempre il più performante. Per attivare il caching userai `'use cache'` — argomento della Lezione 2 (/caching).",
                postscript:
                    "Conseguenza pratica: se vedi tutorial che dicono 'fetch è cachato per default', sono pre-Next 15 e ora sono sbagliati. Il default attuale è uncached.",
            },
            memoization: {
                heading: '3 · Memoization automatica (per render)',
                description:
                    "Diverso dal caching: la memoization è scope-ata al singolo render. Se chiami fetch() due volte con la stessa URL e le stesse opzioni nello stesso albero di componenti, React esegue UNA sola chiamata di rete e riusa il risultato. È il motivo per cui puoi recuperare gli stessi dati nel layout e nella page senza preoccuparti del double-fetch — niente prop drilling necessario.",
                postscript:
                    'Per funzioni non-fetch (es. query al database) usi React.cache() per ottenere la stessa garanzia per-request. Cache != memoization: memoization vive un render; cache vive tra request multiple.',
            },
            dynamic: {
                heading: '4 · cookies() e headers() rendono dinamica la rotta',
                description:
                    'Sono API per-request: il loro valore dipende dalla request specifica. Chiamarle dentro un Server Component dice a Next "questa rotta non può essere prerenderizzata, deve girare a ogni request". È il modo Next 16 di marcare il confine tra contenuto statico (cacheable) e contenuto dinamico (per-request).',
                postscript:
                    'In Next 16 cookies(), headers() e draftMode() sono async — devi awaittarli (breaking change rispetto ai tutorial pre-15).',
            },
        },
        demosHeading: 'Tre demo dal vivo',
        demos: {
            default: {
                label: 'Fetch reale + memoization',
                route: '/lessons/server-fetching/default',
                description:
                    "Fetch dal vero verso jsonplaceholder.typicode.com. Chiamato due volte: la rete vede UNA sola request (memoization). Apri DevTools per la prova.",
            },
            parallel: {
                label: 'Sequenziale vs Promise.all',
                route: '/lessons/server-fetching/parallel',
                description:
                    'Due funzioni locali, ciascuna con 1s di delay. Eseguite in sequenza: ~2s. In parallelo con Promise.all: ~1s. Tempo misurato sul server.',
            },
            dynamic: {
                label: 'cookies() e headers() → dynamic',
                route: '/lessons/server-fetching/dynamic',
                description:
                    'Il Server Component legge cookies() e headers(). La rotta non può essere prerenderizzata. Imposta un cookie con il bottone e ricarica: il valore nuovo arriva dal server.',
            },
        },
        cachingForward:
            "Il caching (use cache, cacheLife, cacheTag, ISR) arriva nella Lezione 2 · /caching. Qui ci concentriamo solo sul modello uncached default.",
    },
    demos: {
        default: {
            badge: 'Demo · /default',
            title: 'Fetch reale + memoization automatica',
            description:
                "Questo Server Component fa await fetch('https://jsonplaceholder.typicode.com/posts') DUE volte nello stesso render. Aspettati: due await, ma una sola chiamata di rete (memoization). Guarda il terminale di npm run dev: dovresti vedere log [fetch] una sola volta per ogni navigazione.",
            firstFetchLabel: 'Risultato 1 (primo await)',
            secondFetchLabel: 'Risultato 2 (secondo await — memoized)',
            memoizationProof:
                "Entrambi i risultati hanno lo stesso `fetched_at`: stessa identica chiamata di rete, riusata da React. Il default uncached di Next 16 non impedisce questa ottimizzazione per-render.",
            backToIndex: '← Indietro alla lezione',
            apiLabel: 'API esterna',
            refreshHint:
                'Ricarica la pagina (Cmd+R): il fetched_at cambia ogni volta — prova che il default Next 16 è uncached.',
        },
        parallel: {
            badge: 'Demo · /parallel',
            title: 'Sequenziale vs parallelo',
            description:
                'Due funzioni locali (getUsers, getPosts) dormono 1s ciascuna. Se le awaiti in sequenza, il totale è ~2s. Se le lanci insieme e awaiti Promise.all, il totale è ~1s. Il guadagno è enorme su rotte data-heavy.',
            sequentialLabel: '🐢 Sequenziale (await uno dopo l\'altro)',
            parallelLabel: '⚡ Parallelo (Promise.all)',
            sequentialBody:
                "const users = await getUsers();   // attende ~1s\nconst posts = await getPosts();   // attende ALTRI ~1s\n// totale: ~2s",
            parallelBody:
                "const usersPromise = getUsers();   // parte\nconst postsPromise = getPosts();   // parte SUBITO dopo\nconst [users, posts] = await Promise.all([\n    usersPromise, postsPromise\n]);\n// totale: ~1s",
            elapsedLabel: 'tempo misurato',
            usersLabel: 'Utenti',
            postsLabel: 'Post',
            backToIndex: '← Indietro alla lezione',
        },
        dynamic: {
            badge: 'Demo · /dynamic',
            title: 'cookies() + headers() forzano dynamic',
            description:
                "Questo Server Component chiama await cookies() e await headers() — entrambe API async dalla 15. Leggerle marca la rotta come dynamic: Next non può prerenderizzarla, ogni request rigirano il componente. La prova: il timestamp del server cambia ogni navigazione/refresh.",
            cookiesLabel: 'Cookies (await cookies())',
            headersLabel: 'Headers selezionati (await headers())',
            serverTimeLabel: 'Server time (rigenerato a ogni request)',
            noCookies: '— nessun cookie impostato —',
            setCookieLabel: 'Imposta cookie nb-demo',
            clearCookieLabel: 'Cancella cookie nb-demo',
            cookieInstructions:
                "Clicca Imposta: il bottone setta document.cookie sul client e chiama router.refresh(). Il payload qui sopra viene rigenerato dal server e mostra il nuovo cookie. Senza router.refresh() il server NON saprebbe del cookie nuovo — è una lezione utile sulla differenza tra client cookie store e server cookie store.",
            backToIndex: '← Indietro alla lezione',
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 2 · Lesson 1',
        title: 'Server Fetching — fetching data on the server',
        intro: 'In RSCs (React Server Components) you fetch data directly with await: no useEffect, no useState, no API route in between. The page is an async function that runs on the server. This lesson shows the default model of Next 16: fetch NOT cached, automatic per-render memoization, sequential vs parallel, and how cookies()/headers() make a route dynamic.',
        sections: {
            asyncRsc: {
                heading: '1 · async Server Component + await fetch',
                description:
                    'The foundational pattern: the page is async, fetch returns a Promise, you await it. Everything happens on the server: the fetch call does not go through the browser, you do not see /api/posts in the Network tab — you only see the HTML document coming back already rendered with the data inside.',
                snippet:
                    "export default async function Page() {\n    const res = await fetch('https://api.example.com/posts');\n    const posts = await res.json();\n    return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}",
            },
            defaultUncached: {
                heading: '2 · Next 16 default: fetch is NOT cached',
                description:
                    "Breaking change vs Next 14: from version 15 onwards, fetch() in a Server Component is NOT cached by default. Every request renders the page and every await fetch makes a new network call. It is the safest behavior (data is always fresh) but not always the most performant. To enable caching you'll use the `'use cache'` directive — covered in Lesson 2 (/caching).",
                postscript:
                    "Practical consequence: if you see tutorials saying 'fetch is cached by default', they are pre-Next 15 and now wrong. The current default is uncached.",
            },
            memoization: {
                heading: '3 · Automatic memoization (per render)',
                description:
                    'Different from caching: memoization is scoped to a single render. If you call fetch() twice with the same URL and the same options inside the same component tree, React performs ONE network call and reuses the result. That is why you can fetch the same data in the layout AND in the page without worrying about double-fetching — no prop drilling needed.',
                postscript:
                    'For non-fetch functions (e.g. database queries) you use React.cache() to get the same per-request guarantee. Cache != memoization: memoization lives one render; cache lives across multiple requests.',
            },
            dynamic: {
                heading: '4 · cookies() and headers() make the route dynamic',
                description:
                    'They are per-request APIs: their value depends on the specific request. Calling them inside a Server Component tells Next "this route cannot be prerendered, it must run on every request". It is the Next 16 way of marking the boundary between static (cacheable) content and dynamic (per-request) content.',
                postscript:
                    'In Next 16 cookies(), headers() and draftMode() are async — you must await them (breaking change vs pre-15 tutorials).',
            },
        },
        demosHeading: 'Three live demos',
        demos: {
            default: {
                label: 'Real fetch + memoization',
                route: '/lessons/server-fetching/default',
                description:
                    'Real fetch to jsonplaceholder.typicode.com. Called twice: the network sees ONE request (memoization). Open DevTools for proof.',
            },
            parallel: {
                label: 'Sequential vs Promise.all',
                route: '/lessons/server-fetching/parallel',
                description:
                    'Two local functions, each with 1s delay. Sequential: ~2s. Promise.all: ~1s. Time measured on the server.',
            },
            dynamic: {
                label: 'cookies() and headers() → dynamic',
                route: '/lessons/server-fetching/dynamic',
                description:
                    'The Server Component reads cookies() and headers(). The route cannot be prerendered. Set a cookie with the button and reload: the new value comes from the server.',
            },
        },
        cachingForward:
            'Caching (use cache, cacheLife, cacheTag, ISR) arrives in Lesson 2 · /caching. Here we focus on the uncached default model only.',
    },
    demos: {
        default: {
            badge: 'Demo · /default',
            title: 'Real fetch + automatic memoization',
            description:
                "This Server Component does await fetch('https://jsonplaceholder.typicode.com/posts') TWICE in the same render. Expectation: two awaits, but only one network call (memoization). Watch the npm run dev terminal: you should see the [fetch] log only once per navigation.",
            firstFetchLabel: 'Result 1 (first await)',
            secondFetchLabel: 'Result 2 (second await — memoized)',
            memoizationProof:
                "Both results have the same `fetched_at`: same network call, reused by React. Next 16's uncached default does not prevent this per-render optimization.",
            backToIndex: '← Back to the lesson',
            apiLabel: 'External API',
            refreshHint:
                'Reload the page (Cmd+R): fetched_at changes every time — proof that the Next 16 default is uncached.',
        },
        parallel: {
            badge: 'Demo · /parallel',
            title: 'Sequential vs parallel',
            description:
                'Two local functions (getUsers, getPosts) each sleep 1s. Awaited sequentially the total is ~2s. Kicked off together and awaited via Promise.all the total is ~1s. The win is huge on data-heavy routes.',
            sequentialLabel: '🐢 Sequential (await one after the other)',
            parallelLabel: '⚡ Parallel (Promise.all)',
            sequentialBody:
                "const users = await getUsers();   // waits ~1s\nconst posts = await getPosts();   // waits ANOTHER ~1s\n// total: ~2s",
            parallelBody:
                "const usersPromise = getUsers();   // starts\nconst postsPromise = getPosts();   // starts IMMEDIATELY after\nconst [users, posts] = await Promise.all([\n    usersPromise, postsPromise\n]);\n// total: ~1s",
            elapsedLabel: 'measured time',
            usersLabel: 'Users',
            postsLabel: 'Posts',
            backToIndex: '← Back to the lesson',
        },
        dynamic: {
            badge: 'Demo · /dynamic',
            title: 'cookies() + headers() force dynamic',
            description:
                'This Server Component calls await cookies() and await headers() — both async APIs since 15. Reading them marks the route as dynamic: Next cannot prerender it, every request re-runs the component. The proof: the server timestamp changes every navigation/refresh.',
            cookiesLabel: 'Cookies (await cookies())',
            headersLabel: 'Selected headers (await headers())',
            serverTimeLabel: 'Server time (regenerated on every request)',
            noCookies: '— no cookie set —',
            setCookieLabel: 'Set nb-demo cookie',
            clearCookieLabel: 'Clear nb-demo cookie',
            cookieInstructions:
                'Click Set: the button sets document.cookie on the client and calls router.refresh(). The payload above is regenerated by the server and shows the new cookie. Without router.refresh() the server would NOT know about the new cookie — a useful lesson about the difference between client cookie store and server cookie store.',
            backToIndex: '← Back to the lesson',
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 2 · Лекція 1',
        title: 'Server Fetching — отримання даних на сервері',
        intro: 'У RSC (React Server Components) ти отримуєш дані прямо через await: жодного useEffect, жодного useState, жодного API route посередині. Сторінка — це async function, що працює на сервері. Ця лекція показує дефолтну модель Next 16: fetch БЕЗ кешу, автоматична per-render мемоізація, sequential vs parallel і як cookies()/headers() роблять маршрут dynamic.',
        sections: {
            asyncRsc: {
                heading: '1 · async Server Component + await fetch',
                description:
                    'Базовий патерн: сторінка — async, fetch повертає Promise, ти його awaitиш. Усе відбувається на сервері: виклик fetch не йде через браузер, ти не побачиш /api/posts у вкладці Network — лише HTML документ, що приходить уже відрендерений з даними всередині.',
                snippet:
                    "export default async function Page() {\n    const res = await fetch('https://api.example.com/posts');\n    const posts = await res.json();\n    return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}",
            },
            defaultUncached: {
                heading: '2 · Дефолт Next 16: fetch БЕЗ кешу',
                description:
                    "Breaking change vs Next 14: починаючи з 15-ї версії, fetch() у Server Component НЕ кешується за замовчуванням. Кожен request рендерить сторінку, і кожен await fetch робить нову мережеву виклику. Це найбезпечніша поведінка (дані завжди свіжі), але не завжди найпродуктивніша. Щоб увімкнути кешування — використовуй `'use cache'`, тема Лекції 2 (/caching).",
                postscript:
                    "Практичний наслідок: якщо туторіал каже 'fetch кешується за замовчуванням', він — pre-Next 15 і вже неправильний. Поточний default — uncached.",
            },
            memoization: {
                heading: '3 · Автоматична мемоізація (per render)',
                description:
                    'Не плутати з кешуванням: мемоізація обмежена одним рендером. Якщо ти викликаєш fetch() двічі з тим самим URL і тими ж options у тому ж дереві компонентів, React робить ОДИН мережевий виклик і перевикористовує результат. Саме тому ти можеш отримувати ті ж самі дані у layout і в page, не хвилюючись про подвійний fetch — prop drilling не потрібен.',
                postscript:
                    'Для не-fetch функцій (напр. запитів до БД) використовуй React.cache() — щоб отримати ту ж per-request гарантію. Cache != memoization: memoization живе один render; cache живе між кількома request-ами.',
            },
            dynamic: {
                heading: '4 · cookies() і headers() роблять маршрут dynamic',
                description:
                    "Це per-request API: їх значення залежить від конкретного запиту. Виклик усередині Server Component каже Next: 'цей маршрут не може бути prerendered, він має виконуватися на кожен запит'. Це спосіб Next 16 позначити межу між статичним (cacheable) і динамічним (per-request) контентом.",
                postscript:
                    'У Next 16 cookies(), headers() і draftMode() — async, їх треба awaitити (breaking change vs pre-15 туторіали).',
            },
        },
        demosHeading: 'Три живі демо',
        demos: {
            default: {
                label: 'Реальний fetch + memoization',
                route: '/lessons/server-fetching/default',
                description:
                    'Реальний fetch до jsonplaceholder.typicode.com. Викликаний двічі: мережа бачить ОДИН запит (memoization). Відкрий DevTools для перевірки.',
            },
            parallel: {
                label: 'Sequential vs Promise.all',
                route: '/lessons/server-fetching/parallel',
                description:
                    'Дві локальні функції з 1с delay кожна. Sequential: ~2с. Promise.all: ~1с. Час виміряно на сервері.',
            },
            dynamic: {
                label: 'cookies() і headers() → dynamic',
                route: '/lessons/server-fetching/dynamic',
                description:
                    'Server Component читає cookies() і headers(). Маршрут не може бути prerendered. Встанови cookie кнопкою і оновись — нове значення приходить із сервера.',
            },
        },
        cachingForward:
            'Кешування (use cache, cacheLife, cacheTag, ISR) — у Лекції 2 · /caching. Тут ми фокусуємось лише на uncached дефолті.',
    },
    demos: {
        default: {
            badge: 'Demo · /default',
            title: 'Реальний fetch + автоматична memoization',
            description:
                "Цей Server Component робить await fetch('https://jsonplaceholder.typicode.com/posts') ДВІЧІ у тому ж рендері. Очікування: два awaits, але один мережевий виклик (memoization). Подивись на термінал npm run dev: лог [fetch] має зʼявитися лише один раз на навігацію.",
            firstFetchLabel: 'Результат 1 (перший await)',
            secondFetchLabel: 'Результат 2 (другий await — memoized)',
            memoizationProof:
                'Обидва результати мають однаковий `fetched_at`: той самий мережевий виклик, перевикористаний React. Uncached дефолт Next 16 не заважає цій per-render оптимізації.',
            backToIndex: '← Назад до лекції',
            apiLabel: 'Зовнішнє API',
            refreshHint:
                'Перезавантаж сторінку (Cmd+R): fetched_at змінюється щоразу — доказ, що дефолт Next 16 — uncached.',
        },
        parallel: {
            badge: 'Demo · /parallel',
            title: 'Sequential vs parallel',
            description:
                'Дві локальні функції (getUsers, getPosts) сплять по 1с. Якщо awaitити послідовно — всього ~2с. Якщо запустити разом і awaitити Promise.all — всього ~1с. Виграш величезний на data-heavy маршрутах.',
            sequentialLabel: '🐢 Sequential (await один за одним)',
            parallelLabel: '⚡ Parallel (Promise.all)',
            sequentialBody:
                "const users = await getUsers();   // чекає ~1с\nconst posts = await getPosts();   // чекає ЩЕ ~1с\n// разом: ~2с",
            parallelBody:
                "const usersPromise = getUsers();   // стартує\nconst postsPromise = getPosts();   // стартує ОДРАЗУ\nconst [users, posts] = await Promise.all([\n    usersPromise, postsPromise\n]);\n// разом: ~1с",
            elapsedLabel: 'виміряний час',
            usersLabel: 'Користувачі',
            postsLabel: 'Пости',
            backToIndex: '← Назад до лекції',
        },
        dynamic: {
            badge: 'Demo · /dynamic',
            title: 'cookies() + headers() форсують dynamic',
            description:
                'Цей Server Component викликає await cookies() і await headers() — обидві async API з 15-ї. Їх читання маркує маршрут як dynamic: Next не може його prerender, кожен request перезапускає компонент. Доказ: server timestamp змінюється з кожною навігацією/refresh.',
            cookiesLabel: 'Cookies (await cookies())',
            headersLabel: 'Вибрані headers (await headers())',
            serverTimeLabel: 'Server time (регенерується на кожен request)',
            noCookies: '— cookie не встановлено —',
            setCookieLabel: 'Встановити nb-demo cookie',
            clearCookieLabel: 'Видалити nb-demo cookie',
            cookieInstructions:
                'Клікни Встановити: кнопка записує document.cookie на клієнті і викликає router.refresh(). Payload вище регенерується сервером і показує новий cookie. Без router.refresh() сервер НЕ дізнався б про новий cookie — корисний урок про різницю між client cookie store і server cookie store.',
            backToIndex: '← Назад до лекції',
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
