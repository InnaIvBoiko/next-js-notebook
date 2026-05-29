// =============================================================================
// app/lessons/context-provider/_lib/content.ts
// Inline i18n dictionary for Module 3 · Lesson 1 (Context Provider).
// Three languages: it (base), en, uk. Keys are type-checked across all three
// via the `Dictionary` shape below.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        whatIs: {
            heading: string;
            description: string;
            snippet: string;
        };
        placement: {
            heading: string;
            description: string;
            snippet: string;
        };
        split: {
            heading: string;
            description: string;
            snippet: string;
        };
        persistence: {
            heading: string;
            description: string;
            snippet: string;
        };
    };
    lab: {
        heading: string;
        description: string;
        themeLabel: string;
        themes: { dark: string; light: string; amber: string };
        previewBody: string;
        readerBadge: string;
        setterBadge: string;
        combinedBadge: string;
        readerNote: string;
        setterNote: string;
        combinedNote: string;
        renderLabel: string;
    };
    debug: {
        heading: string;
        description: string;
        steps: string[];
    };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 3 · Lezione 1',
    title: 'Context Provider',
    intro: 'Un Provider è un nodo dell\'albero React che pubblica un valore a tutti i suoi discendenti senza prop drilling. In App Router c\'è una regola dura: i Provider sono Client (perché usano hooks) e i Server Component non possono leggerli, ma possono ospitarli come children. In questa lezione lo vediamo dal vivo con due demo: la prima è il refactor reale del LangProvider (sollevato da ogni lezione fino a /lessons/layout.tsx), la seconda è una nuova ThemeProvider con split contexts e contatore di re-render.',
    sections: {
        whatIs: {
            heading: '§1 Cos\'è un Context Provider',
            description: 'createContext crea un canale; il <Provider value={...}> pubblica un valore su quel canale; useContext(Channel) lo legge da qualunque punto dell\'albero sotto al Provider. Il Provider è un Client Component perché useState/useEffect vivono solo in runtime client — quindi serve "use client" in cima al file. Un Server Component PUÒ comunque renderizzare un Provider come elemento (passandogli children), perché passare elementi è serializzabile.',
            snippet: `'use client';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<'dark' | 'light' | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (v === null) throw new Error('useTheme must be inside <ThemeProvider>');
  return v;
}`,
        },
        placement: {
            heading: '§2 Dove montarlo (il lift refactor)',
            description: 'Il posto in cui monti il Provider decide COSA condivide lo stato. Prima di questa lezione il notebook aveva 8 <LangProvider> separati — uno per lezione. Cambiavi lingua in /caching, navigavi in /server-actions, e tornava italiano. Soluzione: alza il Provider al layout più alto che copre tutte le rotte interessate. La regola dei docs Next dice anche il contrario: "tieni il provider il più in basso possibile" — perché ogni "use client" sopra fa diventare client tutto il sottoalbero. Il giusto livello è il livello dove vivono i consumer più alti.',
            snippet: `// app/lessons/layout.tsx — SERVER component, ospita un Client provider come children
import { LangProvider } from './_components/lang-provider';

export default function LessonsLayout({ children }) {
  return (
    <LangProvider>
      <header>...</header>
      <main>{children}</main>
    </LangProvider>
  );
}`,
        },
        split: {
            heading: '§3 Split contexts (state + setter)',
            description: 'Con un singolo Context { value, setValue }, ogni cambio di value rerendera TUTTI i consumer, anche quelli che chiamano solo setValue. Separiamo in due contexts: StateContext per il valore, SetterContext per il setter. Wrappiamo il setter in useCallback così la sua reference è stabile. Risultato: i componenti che leggono solo il setter non si rerendano mai quando cambia lo stato. È esattamente il modello mentale dei "selector" di Zustand (prossima lezione).',
            snippet: `const ThemeStateContext  = createContext<Theme | null>(null);
const ThemeSetterContext = createContext<((t: Theme) => void) | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState<Theme>('dark');
  // 🔑 useCallback → reference STABLE → SetterContext value mai nuovo
  const setTheme = useCallback((t: Theme) => setThemeRaw(t), []);
  return (
    <ThemeSetterContext.Provider value={setTheme}>
      <ThemeStateContext.Provider value={theme}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeSetterContext.Provider>
  );
}

// I "lettori" si rerendano al cambio tema. I "scrittori" no.
export const useThemeState  = () => useContext(ThemeStateContext)!;
export const useThemeSetter = () => useContext(ThemeSetterContext)!;`,
        },
        persistence: {
            heading: '§4 Persistenza con sessionStorage',
            description: 'sessionStorage vive solo nel browser, quindi non puoi leggerla durante il render del server. Pattern: parti dal valore di default (\'dark\'), poi al mount leggi sessionStorage in un useEffect e aggiorna lo stato se trovi un valore salvato. Questo causa un breve "flicker" se l\'utente aveva scelto un tema diverso: l\'HTML iniziale è dark, poi salta al tema salvato. È intenzionale — nella prossima lezione (Module 5, /advanced-routing) useremo i cookie e il segmento [lang] per renderizzare già il tema giusto lato server.',
            snippet: `useEffect(() => {
  try {
    const saved = sessionStorage.getItem('living-notebook:theme');
    if (saved === 'dark' || saved === 'light' || saved === 'amber') {
      setThemeRaw(saved);
    }
  } catch { /* private mode / quota */ }
}, []);

const setTheme = useCallback((t: Theme) => {
  setThemeRaw(t);
  try { sessionStorage.setItem('living-notebook:theme', t); } catch {}
}, []);`,
        },
    },
    lab: {
        heading: '🧪 Laboratorio: Theme split context',
        description: 'Tre componenti consumano lo stesso ThemeProvider in tre modi diversi. Ognuno mostra il proprio contatore di re-render. Clicca i bottoni di Tema (centro) e osserva quali contatori salgono.',
        themeLabel: 'Tema',
        themes: { dark: 'scuro', light: 'chiaro', amber: 'ambra' },
        previewBody: 'Questa card legge SOLO lo stato del tema (useThemeState). Cambia colore quando cambia tema → si rerenda.',
        readerBadge: 'Lettore — useThemeState()',
        setterBadge: 'Scrittore split — useThemeSetter()',
        combinedBadge: 'Lettore+scrittore combinato — useTheme()',
        readerNote: 'Sottoscritto allo StateContext. Si rerenda ad ogni cambio tema. ✅ Atteso.',
        setterNote: 'Sottoscritto solo al SetterContext. NON si rerenda al cambio tema. ✅ Vittoria del split.',
        combinedNote: 'Hook "combinato" che legge entrambi i context. Si rerenda al cambio tema anche se usa solo setTheme. ❌ La scorciatoia annulla l\'ottimizzazione.',
        renderLabel: 'render n.',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Apri i DevTools (F12) e segui questi passi per vedere il Context in azione.',
        steps: [
            'Apri /lessons/caching, cambia lingua a EN dalla barra in alto, poi naviga a /lessons/server-actions. La lingua rimane EN: il LangProvider è ora in /lessons/layout.tsx e il suo useState non viene smontato.',
            'Apri la tab Application → Session Storage → localhost. Vedi le chiavi living-notebook:lang e living-notebook:theme aggiornarsi mentre clicchi.',
            'Installa l\'estensione React DevTools. Nella tab Components, trova LangProvider in alto: vedi i due Provider annidati (LangSetterContext e LangStateContext) — è il pattern split visualizzato.',
            'Nella tab React DevTools → Profiler, registra mentre cambi tema nel laboratorio. Il "Scrittore split" non appare nella commit list. Il "Lettore+scrittore combinato" sì.',
            'Forza un refresh hard (Cmd+Shift+R). Per ~50ms vedi il tema di default prima del valore salvato: è il flicker che sessionStorage non può evitare lato server.',
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 3 · Lesson 1',
    title: 'Context Provider',
    intro: 'A Provider is a node in the React tree that publishes a value to all its descendants without prop drilling. In the App Router there is a hard rule: Providers are Client components (they use hooks), and Server Components cannot read them — but Server Components CAN host them as children. This lesson shows it live with two demos: first a real refactor of the LangProvider (lifted from every lesson up to /lessons/layout.tsx), then a fresh ThemeProvider with split contexts and a render counter.',
    sections: {
        whatIs: {
            heading: '§1 What a Context Provider is',
            description: 'createContext creates a channel; <Provider value={...}> publishes a value on that channel; useContext(Channel) reads it from anywhere below the Provider. The Provider is a Client Component because useState/useEffect exist only in the client runtime — hence "use client" at the top of the file. A Server Component CAN still render a Provider as an element (passing children to it), because passing elements is serializable.',
            snippet: `'use client';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<'dark' | 'light' | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (v === null) throw new Error('useTheme must be inside <ThemeProvider>');
  return v;
}`,
        },
        placement: {
            heading: '§2 Where to mount it (the lift refactor)',
            description: 'Where you mount the Provider decides WHAT shares the state. Before this lesson the notebook had 8 separate <LangProvider> — one per lesson. You\'d switch language in /caching, navigate to /server-actions, and the language reset to Italian. Fix: lift the Provider to the highest layout that covers all the routes that should share. The Next docs say the opposite too: "keep the provider as deep as possible" — because any "use client" above turns everything below into client. The right level is where the topmost consumers live.',
            snippet: `// app/lessons/layout.tsx — SERVER component, hosts a Client provider as children
import { LangProvider } from './_components/lang-provider';

export default function LessonsLayout({ children }) {
  return (
    <LangProvider>
      <header>...</header>
      <main>{children}</main>
    </LangProvider>
  );
}`,
        },
        split: {
            heading: '§3 Split contexts (state + setter)',
            description: 'With a single Context { value, setValue }, every change of value re-renders ALL consumers, even those that only call setValue. We split into two contexts: StateContext for the value, SetterContext for the setter. We wrap the setter in useCallback so its reference is stable. Result: components that read only the setter never re-render when the state changes. It\'s exactly the mental model of Zustand\'s "selectors" (next lesson).',
            snippet: `const ThemeStateContext  = createContext<Theme | null>(null);
const ThemeSetterContext = createContext<((t: Theme) => void) | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState<Theme>('dark');
  // 🔑 useCallback → reference STABLE → SetterContext value never new
  const setTheme = useCallback((t: Theme) => setThemeRaw(t), []);
  return (
    <ThemeSetterContext.Provider value={setTheme}>
      <ThemeStateContext.Provider value={theme}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeSetterContext.Provider>
  );
}

// "Readers" re-render on theme change. "Writers" don't.
export const useThemeState  = () => useContext(ThemeStateContext)!;
export const useThemeSetter = () => useContext(ThemeSetterContext)!;`,
        },
        persistence: {
            heading: '§4 Persistence with sessionStorage',
            description: 'sessionStorage lives only in the browser, so you can\'t read it during server render. Pattern: start from the default value (\'dark\'), then at mount read sessionStorage in a useEffect and update state if a saved value exists. This causes a brief "flicker" if the user previously picked a different theme: the initial HTML is dark, then jumps to the saved theme. This is intentional — in the next lesson (Module 5, /advanced-routing) we\'ll use cookies and the [lang] segment to render the right theme on the server right away.',
            snippet: `useEffect(() => {
  try {
    const saved = sessionStorage.getItem('living-notebook:theme');
    if (saved === 'dark' || saved === 'light' || saved === 'amber') {
      setThemeRaw(saved);
    }
  } catch { /* private mode / quota */ }
}, []);

const setTheme = useCallback((t: Theme) => {
  setThemeRaw(t);
  try { sessionStorage.setItem('living-notebook:theme', t); } catch {}
}, []);`,
        },
    },
    lab: {
        heading: '🧪 Lab: Theme split context',
        description: 'Three components consume the same ThemeProvider in three different ways. Each shows its own render counter. Click the Theme buttons (center) and watch which counters tick up.',
        themeLabel: 'Theme',
        themes: { dark: 'dark', light: 'light', amber: 'amber' },
        previewBody: 'This card reads ONLY the theme state (useThemeState). It changes color when the theme changes → it re-renders.',
        readerBadge: 'Reader — useThemeState()',
        setterBadge: 'Split writer — useThemeSetter()',
        combinedBadge: 'Combined reader+writer — useTheme()',
        readerNote: 'Subscribed to StateContext. Re-renders on every theme change. ✅ Expected.',
        setterNote: 'Subscribed only to SetterContext. Does NOT re-render on theme change. ✅ The split wins.',
        combinedNote: 'A "combined" hook that reads both contexts. Re-renders on theme change even though it only uses setTheme. ❌ The shortcut kills the optimization.',
        renderLabel: 'render #',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Open DevTools (F12) and follow these steps to see Context at work.',
        steps: [
            'Open /lessons/caching, switch language to EN from the top bar, then navigate to /lessons/server-actions. The language stays EN: the LangProvider now lives in /lessons/layout.tsx and its useState is not unmounted.',
            'Open the Application tab → Session Storage → localhost. You see the keys living-notebook:lang and living-notebook:theme update as you click.',
            'Install the React DevTools extension. In the Components tab, find LangProvider at the top: you see the two nested Providers (LangSetterContext and LangStateContext) — that\'s the split pattern visualized.',
            'In React DevTools → Profiler, record while you change the theme in the lab. The "Split writer" doesn\'t appear in the commit list. The "Combined reader+writer" does.',
            'Force a hard refresh (Cmd+Shift+R). For ~50ms you see the default theme before the saved value: that\'s the flicker sessionStorage cannot avoid on the server side.',
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 3 · Лекція 1',
    title: 'Context Provider',
    intro: 'Provider — це вузол у дереві React, який публікує значення для всіх своїх нащадків без prop drilling. У App Router є жорстке правило: Provider — це Client компоненти (вони використовують hooks), і Server Components не можуть їх читати — але МОЖУТЬ розміщувати їх як children. У цій лекції ми побачимо це наживо з двома демо: спочатку реальний рефакторинг LangProvider (піднятий з кожної лекції до /lessons/layout.tsx), потім свіжий ThemeProvider зі split контекстами та лічильником re-render.',
    sections: {
        whatIs: {
            heading: '§1 Що таке Context Provider',
            description: 'createContext створює канал; <Provider value={...}> публікує значення в цей канал; useContext(Channel) читає його з будь-якого місця нижче Provider. Provider — це Client Component, тому що useState/useEffect існують лише в client runtime — звідси "use client" вгорі файлу. Server Component МОЖЕ все одно рендерити Provider як елемент (передаючи йому children), бо передача елементів серіалізована.',
            snippet: `'use client';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<'dark' | 'light' | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (v === null) throw new Error('useTheme must be inside <ThemeProvider>');
  return v;
}`,
        },
        placement: {
            heading: '§2 Де його монтувати (lift refactor)',
            description: 'Місце, де ти монтуєш Provider, вирішує ЩО ділиться станом. До цієї лекції в notebook було 8 окремих <LangProvider> — по одному на лекцію. Ти змінював мову в /caching, переходив у /server-actions, і мова скидалась на італійську. Виправлення: підніми Provider до найвищого layout, який покриває всі маршрути, що мають ділитися. Документи Next кажуть і навпаки: "тримай provider якомога глибше" — бо будь-який "use client" вгорі робить client все нижче. Правильний рівень — це рівень, де живуть найвищі consumers.',
            snippet: `// app/lessons/layout.tsx — SERVER component, розміщує Client provider як children
import { LangProvider } from './_components/lang-provider';

export default function LessonsLayout({ children }) {
  return (
    <LangProvider>
      <header>...</header>
      <main>{children}</main>
    </LangProvider>
  );
}`,
        },
        split: {
            heading: '§3 Split контексти (state + setter)',
            description: 'З одним Context { value, setValue } кожна зміна value перерендерює ВСІХ consumers, навіть тих, що лише викликають setValue. Розділяємо на два контексти: StateContext для значення, SetterContext для setter. Загортаємо setter у useCallback, щоб його reference був стабільний. Результат: компоненти, що читають лише setter, ніколи не перерендерюються при зміні стану. Це точна ментальна модель "селекторів" Zustand (наступна лекція).',
            snippet: `const ThemeStateContext  = createContext<Theme | null>(null);
const ThemeSetterContext = createContext<((t: Theme) => void) | null>(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState<Theme>('dark');
  // 🔑 useCallback → reference СТАБІЛЬНИЙ → SetterContext value ніколи не новий
  const setTheme = useCallback((t: Theme) => setThemeRaw(t), []);
  return (
    <ThemeSetterContext.Provider value={setTheme}>
      <ThemeStateContext.Provider value={theme}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeSetterContext.Provider>
  );
}

// "Читачі" перерендерюються при зміні теми. "Письменники" — ні.
export const useThemeState  = () => useContext(ThemeStateContext)!;
export const useThemeSetter = () => useContext(ThemeSetterContext)!;`,
        },
        persistence: {
            heading: '§4 Persistence з sessionStorage',
            description: 'sessionStorage існує лише в браузері, тому ти не можеш її читати під час server render. Патерн: почни зі значення за замовчуванням (\'dark\'), потім на mount прочитай sessionStorage у useEffect і онови стан, якщо знайдеш збережене значення. Це викликає короткий "flicker", якщо користувач раніше вибрав іншу тему: початковий HTML — dark, потім стрибає до збереженої теми. Це навмисне — у наступній лекції (Модуль 5, /advanced-routing) використаємо cookies та сегмент [lang], щоб одразу рендерити правильну тему на сервері.',
            snippet: `useEffect(() => {
  try {
    const saved = sessionStorage.getItem('living-notebook:theme');
    if (saved === 'dark' || saved === 'light' || saved === 'amber') {
      setThemeRaw(saved);
    }
  } catch { /* private mode / quota */ }
}, []);

const setTheme = useCallback((t: Theme) => {
  setThemeRaw(t);
  try { sessionStorage.setItem('living-notebook:theme', t); } catch {}
}, []);`,
        },
    },
    lab: {
        heading: '🧪 Лабораторія: Theme split context',
        description: 'Три компоненти споживають один і той же ThemeProvider трьома різними способами. Кожен показує свій лічильник re-render. Натисни кнопки Тема (центр) і дивись, які лічильники зростають.',
        themeLabel: 'Тема',
        themes: { dark: 'темна', light: 'світла', amber: 'amber' },
        previewBody: 'Ця картка читає ЛИШЕ стан теми (useThemeState). Вона змінює колір при зміні теми → перерендерюється.',
        readerBadge: 'Читач — useThemeState()',
        setterBadge: 'Split письменник — useThemeSetter()',
        combinedBadge: 'Комбінований читач+письменник — useTheme()',
        readerNote: 'Підписаний на StateContext. Перерендерюється при кожній зміні теми. ✅ Очікувано.',
        setterNote: 'Підписаний лише на SetterContext. НЕ перерендерюється при зміні теми. ✅ Перемога split.',
        combinedNote: 'Хук "комбінований", що читає обидва контексти. Перерендерюється при зміні теми, навіть коли використовує лише setTheme. ❌ Скорочення знищує оптимізацію.',
        renderLabel: 'рендер №',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Відкрий DevTools (F12) і слідуй цим крокам, щоб побачити Context у дії.',
        steps: [
            'Відкрий /lessons/caching, переключи мову на EN з верхньої панелі, потім перейди на /lessons/server-actions. Мова залишається EN: LangProvider тепер живе в /lessons/layout.tsx і його useState не демонтується.',
            'Відкрий вкладку Application → Session Storage → localhost. Бачиш, як ключі living-notebook:lang і living-notebook:theme оновлюються при кліках.',
            'Встанови React DevTools. У вкладці Components знайди LangProvider зверху: бачиш два вкладені Providers (LangSetterContext і LangStateContext) — це візуалізований split патерн.',
            'У React DevTools → Profiler запиши, поки змінюєш тему в лабораторії. "Split письменник" не з\'являється в commit list. "Комбінований" — так.',
            'Зроби hard refresh (Cmd+Shift+R). Протягом ~50ms бачиш тему за замовчуванням перед збереженим значенням: це flicker, якого sessionStorage не може уникнути на стороні сервера.',
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
