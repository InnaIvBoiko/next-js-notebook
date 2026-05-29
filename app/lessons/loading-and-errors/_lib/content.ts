// =============================================================================
// app/lessons/loading-and-errors/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /loading-and-errors + demos.
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
            loadingFile: {
                heading: string;
                description: string;
                postscript: string;
            };
            suspenseManual: {
                heading: string;
                description: string;
                postscript: string;
            };
            errorFile: {
                heading: string;
                description: string;
                retryNote: string;
                globalNote: string;
            };
            hierarchy: {
                heading: string;
                description: string;
            };
        };
        demosHeading: string;
        demos: {
            slow: { label: string; route: string; description: string };
            streaming: {
                label: string;
                route: string;
                description: string;
            };
            boom: { label: string; route: string; description: string };
        };
    };
    demos: {
        slow: DemoCopy & {
            payloadLabel: string;
            elapsedLabel: string;
            backToIndex: string;
        };
        streaming: DemoCopy & {
            instantHeading: string;
            instantBody: string;
            fastHeading: string;
            fastFallback: string;
            slowHeading: string;
            slowFallback: string;
            backToIndex: string;
        };
        boom: DemoCopy & {
            triggerLabel: string;
            calmLabel: string;
            backToIndex: string;
            instructions: string;
        };
    };
    loadingFallback: {
        title: string;
        hint: string;
    };
    errorBoundary: {
        badge: string;
        title: string;
        digestLabel: string;
        retryLabel: string;
        retryHint: string;
        backToIndex: string;
        resetNote: string;
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    index: {
        badge: 'Modulo 1 · Lezione 4',
        title: 'Loading & Errors — i due failure mode di ogni rotta',
        intro: 'Ogni pagina può essere LENTA o ROTTA. L\'App Router dà a entrambi un file convention dedicato: loading.tsx (Suspense boundary scoped al segmento) e error.tsx (React Error Boundary scoped al segmento). In più, dentro la pagina puoi piazzare <Suspense> manuali per fare streaming granulare. Questa lezione mostra tutti e tre i meccanismi e te li fa vedere dal vivo nei tre demo sotto.',
        sections: {
            loadingFile: {
                heading: '1 · loading.tsx — il fallback istantaneo del segmento',
                description:
                    "Mettendo un file loading.tsx accanto a page.tsx, Next avvolge automaticamente la pagina (e i layout figli) in un <Suspense fallback={<Loading/>}>. Appena navighi verso quel segmento il fallback appare immediatamente, mentre il server continua a renderizzare. Il fallback viene swappato non appena il contenuto è pronto. Importante: il layout SOPRA il loading.tsx resta interattivo (la pillola lingua continua a rispondere).",
                postscript:
                    'loading.tsx NON avvolge layout.tsx, template.tsx o error.tsx dello stesso segmento. È pensato per lo "shell vs content" pattern: la chrome resta visibile, il payload riempie il buco.',
            },
            suspenseManual: {
                heading: '2 · <Suspense> manuale — streaming granulare',
                description:
                    "loading.tsx è un Suspense a livello di segmento (uno solo). Dentro una pagina puoi metterne quanti vuoi, ciascuno con il suo fallback. Il server inizia lo streaming HTML dal primo chunk pronto; ogni boundary si risolve indipendentemente. Risultato: l'utente vede progressivamente i pezzi della pagina apparire, invece di aspettare il più lento.",
                postscript:
                    'Pattern di produzione: avvolgi ogni sezione data-driven nella sua Suspense, NON la pagina intera. Così la chrome appare subito, le sezioni lente non bloccano quelle veloci, e il TTFB resta basso.',
            },
            errorFile: {
                heading: '3 · error.tsx — la rete di sicurezza del segmento',
                description:
                    "Se un Server Component throws durante il rendering, error.tsx (che DEVE essere un Client Component perché un Error Boundary React richiede classi/effetti client) cattura l'eccezione e renderizza il fallback. Il layout sopra resta montato — non perdi la chrome, non perdi lo stato dei provider sopra.",
                retryNote:
                    "Next 16.2 ha introdotto la prop `unstable_retry`: chiamandola, Next re-renderizza il sottoalbero del boundary. Sostituisce la vecchia prop `reset` (che vedrai ancora in molti tutorial online — è ancora supportata ma deprecata).",
                globalNote:
                    'Per errori nel ROOT layout esiste global-error.tsx (sostituisce il root layout, deve renderizzare <html> e <body> di suo). Lo useresti per crash davvero catastrofici. Non lo implementiamo qui per non toccare il root layout esistente.',
            },
            hierarchy: {
                heading: '4 · Gerarchia: chi avvolge chi',
                description:
                    "L'ordine nello stesso segmento (dall'esterno verso l'interno): layout → template → error boundary → suspense boundary (loading) → not-found → page. Conseguenze pratiche: error.tsx NON cattura errori del layout dello stesso segmento (usa global-error o sposta la logica dentro page). loading.tsx NON copre il layout (per quello servono <Suspense> manuali).",
            },
        },
        demosHeading: 'Tre demo dal vivo',
        demos: {
            slow: {
                label: 'Pagina lenta + loading.tsx',
                route: '/lessons/loading-and-errors/slow',
                description:
                    'Il Server Component dorme 1.5s prima di renderizzare. Il loading.tsx del segmento mostra lo scheletro nel frattempo.',
            },
            streaming: {
                label: 'Streaming con <Suspense> manuale',
                route: '/lessons/loading-and-errors/streaming',
                description:
                    'Tre sezioni: una istantanea, una pronta a 1s, una a 3s. Ogni sezione ha la sua Suspense — appaiono progressivamente.',
            },
            boom: {
                label: 'error.tsx + unstable_retry',
                route: '/lessons/loading-and-errors/boom',
                description:
                    "Un bottone fa throwing al render successivo. error.tsx cattura. Il retry rimonta i children e ricomincia da capo.",
            },
        },
    },
    demos: {
        slow: {
            badge: 'Demo · /slow',
            title: 'Pagina volutamente lenta',
            description:
                'Questo Server Component fa await delay(1500) prima di rispondere. Mentre dorme, il loading.tsx vicino mostra lo scheletro. La chrome del layout (pillola verde "layout clicks" sopra, pillola lingua qui sotto) resta interattiva — provala mentre il page sta ancora caricando.',
            payloadLabel: 'Payload (server)',
            elapsedLabel: 'Generato al server time',
            backToIndex: '← Indietro alla lezione',
        },
        streaming: {
            badge: 'Demo · /streaming',
            title: 'Streaming granulare con <Suspense>',
            description:
                "Tre sezioni nella stessa pagina, ciascuna con la sua Suspense. Il server inizia a streammare subito: la sezione istantanea appare immediatamente, la veloce dopo ~1s, la lenta dopo ~3s. Apri il tab Network e osserva il document HTML che continua ad arrivare a pezzi.",
            instantHeading: 'Sezione istantanea (no await)',
            instantBody:
                'Questa è una porzione di pagina sincrona. Compare insieme alla chrome.',
            fastHeading: 'Sezione veloce (~1s)',
            fastFallback: 'Caricamento sezione veloce…',
            slowHeading: 'Sezione lenta (~3s)',
            slowFallback: 'Caricamento sezione lenta…',
            backToIndex: '← Indietro alla lezione',
        },
        boom: {
            badge: 'Demo · /boom',
            title: 'Trigger di un errore di rendering',
            description:
                'Clicca il pulsante rosso. Il prossimo render del componente lancerà un Error. Il segmento è avvolto da error.tsx (qui accanto): vedrai il boundary con il pulsante Retry, che usa la nuova prop unstable_retry di Next 16.2.',
            triggerLabel: 'Boom! 💥 (trigger throw on next render)',
            calmLabel: 'Tutto tranquillo. Premi il pulsante sopra.',
            backToIndex: '← Indietro alla lezione',
            instructions:
                'Nota: la pillola verde "layout clicks" in alto è nel /lessons layout, NON in /boom. Quando salta in aria solo /boom/page.tsx, la pillola sopra resta intatta. Prova: cliccala 3 volte prima del boom, fai boom, premi Retry — il conteggio è ancora 3.',
        },
    },
    loadingFallback: {
        title: 'Caricamento in corso…',
        hint: 'Questo è il file slow/loading.tsx — auto-wrap della <Suspense>.',
    },
    errorBoundary: {
        badge: 'error.tsx · rete di sicurezza',
        title: 'Qualcosa è andato storto',
        digestLabel: 'digest',
        retryLabel: 'Riprova (unstable_retry)',
        retryHint:
            'Riprova chiama unstable_retry(): Next rimonta i children del boundary. Il Client state del componente che ha thrown viene ricreato da zero — il bottone Boom torna disponibile.',
        backToIndex: '← Indietro alla lezione',
        resetNote:
            'Vedrai ancora `reset` invece di `unstable_retry` in molti tutorial. Sono semanticamente la stessa cosa; unstable_retry è la nuova API di Next 16.2.',
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 1 · Lesson 4',
        title: 'Loading & Errors — every route\'s two failure modes',
        intro: "Every page can be SLOW or BROKEN. The App Router gives each a dedicated file convention: loading.tsx (a segment-scoped Suspense boundary) and error.tsx (a segment-scoped React Error Boundary). On top of that, inside a page you can place manual <Suspense> boundaries for granular streaming. This lesson shows all three mechanisms and lets you see each one live in the three demos below.",
        sections: {
            loadingFile: {
                heading: '1 · loading.tsx — instant segment fallback',
                description:
                    "By placing a loading.tsx file next to page.tsx, Next automatically wraps the page (and its child layouts) in <Suspense fallback={<Loading/>}>. The moment you navigate to that segment, the fallback appears immediately while the server keeps rendering. The fallback is swapped out as soon as the content is ready. Important: the layout ABOVE loading.tsx stays interactive (the language pill keeps responding).",
                postscript:
                    'loading.tsx does NOT wrap layout.tsx, template.tsx or error.tsx in the same segment. It is designed for the "shell vs content" pattern: chrome stays visible, payload fills the hole.',
            },
            suspenseManual: {
                heading: '2 · Manual <Suspense> — granular streaming',
                description:
                    "loading.tsx is one segment-level Suspense (just one). Inside a page you can place as many as you want, each with its own fallback. The server starts streaming HTML from the first ready chunk; each boundary resolves independently. Result: the user sees the pieces of the page appear progressively, instead of waiting for the slowest one.",
                postscript:
                    'Production pattern: wrap each data-driven section in its own Suspense, NOT the whole page. That way the chrome appears instantly, slow sections do not block fast ones, and TTFB stays low.',
            },
            errorFile: {
                heading: '3 · error.tsx — the segment safety net',
                description:
                    "If a Server Component throws while rendering, error.tsx (which MUST be a Client Component because a React Error Boundary needs class/client effects) catches the exception and renders the fallback. The layout above stays mounted — you do not lose the chrome, you do not lose the state of providers above.",
                retryNote:
                    'Next 16.2 introduced the `unstable_retry` prop: calling it makes Next re-render the boundary subtree. It replaces the older `reset` prop (which you will still see in many tutorials online — still supported but deprecated).',
                globalNote:
                    'For errors in the ROOT layout there is global-error.tsx (it replaces the root layout, so it must render its own <html> and <body>). You would use it for truly catastrophic crashes. We do not implement it here to avoid touching the existing root layout.',
            },
            hierarchy: {
                heading: '4 · Hierarchy: who wraps whom',
                description:
                    "Order in the same segment (outermost → innermost): layout → template → error boundary → suspense boundary (loading) → not-found → page. Practical consequences: error.tsx does NOT catch errors in the layout of the same segment (use global-error or move the logic inside page). loading.tsx does NOT cover the layout (for that you need manual <Suspense>).",
            },
        },
        demosHeading: 'Three live demos',
        demos: {
            slow: {
                label: 'Slow page + loading.tsx',
                route: '/lessons/loading-and-errors/slow',
                description:
                    'The Server Component sleeps 1.5s before rendering. The segment loading.tsx shows the skeleton in the meantime.',
            },
            streaming: {
                label: 'Streaming with manual <Suspense>',
                route: '/lessons/loading-and-errors/streaming',
                description:
                    'Three sections: one instant, one ready at ~1s, one at ~3s. Each section has its own Suspense — they appear progressively.',
            },
            boom: {
                label: 'error.tsx + unstable_retry',
                route: '/lessons/loading-and-errors/boom',
                description:
                    'A button throws on the next render. error.tsx catches. Retry remounts the children and starts fresh.',
            },
        },
    },
    demos: {
        slow: {
            badge: 'Demo · /slow',
            title: 'Intentionally slow page',
            description:
                'This Server Component does await delay(1500) before responding. While it sleeps, the loading.tsx next to it shows the skeleton. The layout chrome (the green "layout clicks" pill above, the language pill below) stays interactive — try it while the page is still loading.',
            payloadLabel: 'Payload (server)',
            elapsedLabel: 'Server-generated at',
            backToIndex: '← Back to the lesson',
        },
        streaming: {
            badge: 'Demo · /streaming',
            title: 'Granular streaming with <Suspense>',
            description:
                'Three sections in the same page, each with its own Suspense. The server starts streaming immediately: the instant section appears right away, the fast one after ~1s, the slow one after ~3s. Open the Network tab and watch the document HTML keep arriving in pieces.',
            instantHeading: 'Instant section (no await)',
            instantBody:
                'This is a synchronous slice of the page. It appears together with the chrome.',
            fastHeading: 'Fast section (~1s)',
            fastFallback: 'Loading fast section…',
            slowHeading: 'Slow section (~3s)',
            slowFallback: 'Loading slow section…',
            backToIndex: '← Back to the lesson',
        },
        boom: {
            badge: 'Demo · /boom',
            title: 'Triggering a rendering error',
            description:
                'Click the red button. The next render of the component will throw an Error. The segment is wrapped by error.tsx (right next to it): you will see the boundary with its Retry button, which uses the new unstable_retry prop from Next 16.2.',
            triggerLabel: 'Boom! 💥 (trigger throw on next render)',
            calmLabel: 'All quiet. Press the button above.',
            backToIndex: '← Back to the lesson',
            instructions:
                'Note: the green "layout clicks" pill at the top is in the /lessons layout, NOT in /boom. When only /boom/page.tsx blows up, the pill above stays intact. Try it: click it 3 times before the boom, trigger the boom, press Retry — the count is still 3.',
        },
    },
    loadingFallback: {
        title: 'Loading…',
        hint: 'This is the slow/loading.tsx file — Next\'s auto <Suspense> wrap.',
    },
    errorBoundary: {
        badge: 'error.tsx · safety net',
        title: 'Something went wrong',
        digestLabel: 'digest',
        retryLabel: 'Retry (unstable_retry)',
        retryHint:
            'Retry calls unstable_retry(): Next remounts the boundary children. The Client state of the component that threw is recreated from scratch — the Boom button is available again.',
        backToIndex: '← Back to the lesson',
        resetNote:
            'You will still see `reset` instead of `unstable_retry` in many tutorials. They are semantically the same; unstable_retry is the new Next 16.2 API.',
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 1 · Лекція 4',
        title: 'Loading & Errors — два режими відмови будь-якого маршруту',
        intro: "Будь-яка сторінка може бути ПОВІЛЬНОЮ або ЗЛАМАНОЮ. App Router дає кожному режиму свій файл-конвенцію: loading.tsx (Suspense boundary на рівні сегмента) і error.tsx (React Error Boundary на рівні сегмента). Додатково всередині сторінки ти можеш ставити свої <Suspense> для granular streaming. Ця лекція показує всі три механізми і дає побачити їх у дії у трьох демо нижче.",
        sections: {
            loadingFile: {
                heading: '1 · loading.tsx — миттєвий fallback сегмента',
                description:
                    "Розмістивши файл loading.tsx поряд із page.tsx, Next автоматично обгортає сторінку (і дочірні layout-и) у <Suspense fallback={<Loading/>}>. Як тільки ти переходиш у цей сегмент, fallback зʼявляється миттєво, поки сервер далі рендерить. Fallback замінюється контентом, щойно той готовий. Важливо: layout НАД loading.tsx залишається інтерактивним (пігулка мови продовжує реагувати).",
                postscript:
                    'loading.tsx НЕ обгортає layout.tsx, template.tsx чи error.tsx того ж сегмента. Він створений для патерну "shell vs content": chrome лишається на місці, payload заповнює діру.',
            },
            suspenseManual: {
                heading: '2 · Ручний <Suspense> — granular streaming',
                description:
                    'loading.tsx — це ОДИН Suspense на рівні сегмента. Усередині сторінки ти можеш ставити їх скільки хочеш, кожен зі своїм fallback. Сервер починає стрімити HTML з першого готового шматка; кожен boundary резолвиться незалежно. Результат: користувач бачить, як шматки сторінки зʼявляються поступово, замість чекати найповільніший.',
                postscript:
                    'Production-патерн: обгортай у Suspense КОЖНУ data-driven секцію, НЕ всю сторінку. Тоді chrome зʼявляється одразу, повільні секції не блокують швидкі, а TTFB залишається низьким.',
            },
            errorFile: {
                heading: '3 · error.tsx — захисна сітка сегмента',
                description:
                    "Якщо Server Component throws під час рендерингу, error.tsx (який МАЄ бути Client Component, бо React Error Boundary потребує класів/клієнтських ефектів) ловить виняток і рендерить fallback. Layout зверху залишається змонтованим — ти не втрачаєш chrome, не втрачаєш state провайдерів вище.",
                retryNote:
                    'Next 16.2 ввів prop `unstable_retry`: виклик змушує Next перерендерити піддерево boundary. Він замінює стару prop `reset` (яку ще побачиш у багатьох туторіалах — підтримується, але deprecated).',
                globalNote:
                    'Для помилок у ROOT layout існує global-error.tsx (він замінює root layout — має сам рендерити <html> і <body>). Використовується для справді катастрофічних збоїв. Тут ми не імплементуємо його, щоб не торкати існуючий root layout.',
            },
            hierarchy: {
                heading: '4 · Ієрархія: хто кого обгортає',
                description:
                    "Порядок у тому самому сегменті (зверху всередину): layout → template → error boundary → suspense boundary (loading) → not-found → page. Практичні наслідки: error.tsx НЕ ловить помилки layout того ж сегмента (використовуй global-error або винеси логіку у page). loading.tsx НЕ покриває layout (для цього потрібен ручний <Suspense>).",
            },
        },
        demosHeading: 'Три живі демо',
        demos: {
            slow: {
                label: 'Повільна сторінка + loading.tsx',
                route: '/lessons/loading-and-errors/slow',
                description:
                    'Server Component спить 1.5с перед рендером. Сегментний loading.tsx показує скелетон у цей час.',
            },
            streaming: {
                label: 'Streaming через ручні <Suspense>',
                route: '/lessons/loading-and-errors/streaming',
                description:
                    'Три секції: одна миттєва, одна готова за ~1с, одна за ~3с. У кожної свій Suspense — зʼявляються поступово.',
            },
            boom: {
                label: 'error.tsx + unstable_retry',
                route: '/lessons/loading-and-errors/boom',
                description:
                    'Кнопка кидає Error на наступному рендері. error.tsx ловить. Retry перемонтовує дітей і починає з чистого аркуша.',
            },
        },
    },
    demos: {
        slow: {
            badge: 'Demo · /slow',
            title: 'Навмисно повільна сторінка',
            description:
                'Цей Server Component робить await delay(1500) перед відповіддю. Поки він спить, сусідній loading.tsx показує скелетон. Chrome layout (зелена пігулка "layout clicks" зверху, пігулка мови нижче) залишається інтерактивною — спробуй під час завантаження.',
            payloadLabel: 'Payload (server)',
            elapsedLabel: 'Згенеровано сервером о',
            backToIndex: '← Назад до лекції',
        },
        streaming: {
            badge: 'Demo · /streaming',
            title: 'Granular streaming через <Suspense>',
            description:
                "Три секції на одній сторінці, у кожної свій Suspense. Сервер починає стрімити одразу: миттєва секція зʼявляється відразу, швидка через ~1с, повільна через ~3с. Відкрий вкладку Network і поспостерігай, як document HTML продовжує приходити шматками.",
            instantHeading: 'Миттєва секція (без await)',
            instantBody:
                'Це синхронна частина сторінки. Вона зʼявляється разом з chrome.',
            fastHeading: 'Швидка секція (~1с)',
            fastFallback: 'Завантаження швидкої секції…',
            slowHeading: 'Повільна секція (~3с)',
            slowFallback: 'Завантаження повільної секції…',
            backToIndex: '← Назад до лекції',
        },
        boom: {
            badge: 'Demo · /boom',
            title: 'Тригер помилки рендерингу',
            description:
                'Клікни червону кнопку. Наступний рендер компонента кидає Error. Сегмент обгорнутий у error.tsx (поряд): ти побачиш boundary з кнопкою Retry, яка використовує нову prop unstable_retry з Next 16.2.',
            triggerLabel: 'Boom! 💥 (throw на наступний render)',
            calmLabel: 'Усе спокійно. Натисни кнопку вище.',
            backToIndex: '← Назад до лекції',
            instructions:
                "Зверни увагу: зелена пігулка 'layout clicks' зверху — у /lessons layout, НЕ в /boom. Коли вибухає лише /boom/page.tsx, пігулка зверху не зачеплена. Спробуй: клікни 3 рази до boom, зроби boom, натисни Retry — лічильник усе ще 3.",
        },
    },
    loadingFallback: {
        title: 'Завантаження…',
        hint: 'Це файл slow/loading.tsx — авто-обгортання Next у <Suspense>.',
    },
    errorBoundary: {
        badge: 'error.tsx · захисна сітка',
        title: 'Щось пішло не так',
        digestLabel: 'digest',
        retryLabel: 'Повторити (unstable_retry)',
        retryHint:
            'Повторити викликає unstable_retry(): Next перемонтовує дітей boundary. Client state компонента, який кинув помилку, створюється з нуля — кнопка Boom знову доступна.',
        backToIndex: '← Назад до лекції',
        resetNote:
            'Ти ще побачиш `reset` замість `unstable_retry` у багатьох туторіалах. Семантично це одне й те саме; unstable_retry — нова API Next 16.2.',
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
