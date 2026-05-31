// =============================================================================
// app/lessons/optimization-media/_lib/content.ts
// Inline i18n dictionary for Module 5 · Lesson 1 (Images & Fonts).
// -----------------------------------------------------------------------------
// Same pattern as the other lessons: a single `Dictionary` shape, three
// translations (IT base, EN, UK), one `content` map exported at the bottom.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        pipeline: Section;
        sourceA1: Section;
        sourceA2: Section;
        sourceA3: Section;
        layoutB1: Section;
        layoutB2: Section;
        fonts: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        sourceDemo: { badge: string; description: string };
        layoutDemo: { badge: string; description: string };
        fontDemo: {
            badge: string;
            description: string;
            sansLabel: string;
            monoLabel: string;
            sample: string;
            codeSample: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 5 · Lezione 1',
    title: 'Immagini & Font',
    intro: '`next/image` e `next/font` non sono "wrapper carini" intorno a `<img>` e `<link rel=stylesheet>`: sono una **pipeline di ottimizzazione** che gira parte a build time e parte su un endpoint server (`/_next/image`). Il risultato: zero CLS, formati moderni (WebP/AVIF) serviti automaticamente, font self-hostati con zero round-trip a Google. In questa lezione vediamo le tre sorgenti immagine (static import, /public, remote), le due strategie di layout (width/height vs fill+sizes), e il pattern Sans + Mono via CSS variables per legare i font a Tailwind.',
    sections: {
        pipeline: {
            heading: '§1 Cosa succede davvero quando usi <Image>',
            description:
                'L\'HTML finale non è un singolo `<img>`. Next genera:\n\n• Un `<img>` con `srcset` che elenca **più dimensioni** dello stesso file (es. 640w/750w/828w/1080w/1200w/1920w...). Il browser sceglie quella giusta in base a viewport + DPR.\n• Un attributo `sizes` (default `100vw` se non lo passi) che dice al browser quanta larghezza occuperà l\'immagine a ogni breakpoint.\n• `width`/`height` HTML per riservare lo spazio → CLS = 0.\n• `loading="lazy"` di default (tranne `priority`), `decoding="async"`.\n• Un endpoint runtime `/_next/image?url=...&w=...&q=...` che on-demand fa resize + convert in WebP/AVIF e lo cacha.\n\nQuesta è la differenza chiave con un `<img>` normale: Next non spedisce UN file, spedisce N varianti su misura per il dispositivo.',
            snippet: `// HTML generato (semplificato) per: <Image src="/hero.jpg" width={1600} height={900} />
<img
  alt="..."
  loading="lazy"
  decoding="async"
  width="1600"
  height="900"
  srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w,
          /_next/image?url=%2Fhero.jpg&w=750&q=75 750w,
          /_next/image?url=%2Fhero.jpg&w=828&q=75 828w,
          /_next/image?url=%2Fhero.jpg&w=1080&q=75 1080w,
          /_next/image?url=%2Fhero.jpg&w=1200&q=75 1200w,
          /_next/image?url=%2Fhero.jpg&w=1920&q=75 1920w"
  sizes="100vw"
  src="/_next/image?url=%2Fhero.jpg&w=1920&q=75"
/>`,
        },
        sourceA1: {
            heading: '§2 Sorgente A1 — Static import',
            description:
                "L'import diretto del file è la modalità più potente: Next legge il file a **build time**, ne ricava `width`/`height` intrinseci, e genera un `blurDataURL` (10×10 base64) che diventa lo splash di caricamento. Il componente `<Image src={obj} />` riceve un oggetto `StaticImageData`, non una stringa. Risultato: ZERO config, CLS = 0, blur-up gratuito. Limite: solo per file co-locati col codice (hero, illustrazioni, brand assets) — non puoi importare UGC o roba da CMS.",
            snippet: `// app/lessons/optimization-media/_components/image-source-demo.tsx
import Image from 'next/image';
import hero from '../_assets/hero.jpg'; // ← StaticImageData, NOT a string

<Image
  src={hero}            // contiene width, height, blurDataURL
  alt="Foresta in alto"
  placeholder="blur"    // ← gratis grazie allo static import
  sizes="(max-width: 768px) 100vw, 800px"
  priority              // ← LCP candidate: precarica + niente lazy-load
/>`,
        },
        sourceA2: {
            heading: '§2.1 Sorgente A2 — Path string da /public',
            description:
                'Il file vive in `/public/optimization-media/avatar.jpg` ed è referenziato come stringa `"/optimization-media/avatar.jpg"`. Next NON conosce le dimensioni intrinseche a build time → DEVI passare `width`/`height` espliciti. È il pattern classico per asset "hostati ma fissi" (favicon, logo, immagini di marketing). Niente blur automatico: se lo vuoi, devi generare e passare tu il `blurDataURL`.',
            snippet: `// Path string — il file vive in /public/optimization-media/avatar.jpg
import Image from 'next/image';

<Image
  src="/optimization-media/avatar.jpg"   // ← stringa, relativa a /public
  alt="Avatar"
  width={120}                            // ← obbligatorio
  height={120}                           // ← obbligatorio
  className="rounded-full"
/>`,
        },
        sourceA3: {
            heading: '§2.2 Sorgente A3 — Remote URL (CMS / S3 / CDN)',
            description:
                'Il src è un URL assoluto. Per evitare di trasformare il tuo endpoint `/_next/image` in un proxy aperto (DoS, SSRF, hot-link laundering), Next blocca tutto ciò che non è nelle `remotePatterns` di `next.config.ts`. Errore tipico: "Invalid src prop... hostname is not configured". Soluzione: aggiungi il pattern. Senza dimensioni a build time, anche qui passi `width`/`height` o usi `fill`. In questa lezione abbiamo abilitato `picsum.photos` come whitelist.',
            snippet: `// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
  ],
}

// Componente
<Image
  src="https://picsum.photos/seed/notebook-remote/1200/600"
  alt="Remote (Lorem Picsum)"
  width={1200}
  height={600}
  unoptimized={false}   // default: passa per /_next/image (resize + WebP)
/>`,
        },
        layoutB1: {
            heading: '§3 Layout B1 — width/height espliciti',
            description:
                "L'aspect-ratio è derivato da `width/height` e l'altezza HTML viene riservata PRIMA che l'immagine carichi → CLS = 0. Usa questo pattern quando conosci la dimensione intrinseca (hero, avatar, screenshot, illustrazioni). Le dimensioni HTML non determinano il render: puoi sempre sovrascrivere con CSS (`className=\"w-full h-auto\"`). Quello che conta è l'aspect-ratio.",
            snippet: `<Image
  src={hero}
  alt="Hero"
  // width/height arrivano dallo static import; per /public + remote li passi tu
  className="w-full h-auto rounded-lg"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>`,
        },
        layoutB2: {
            heading: '§3.1 Layout B2 — fill + sizes',
            description:
                "Quando l'immagine deve **adattarsi al container** (card in una griglia responsive, hero che riempie il viewport), `width`/`height` espliciti non bastano. Usi `fill`: l'immagine diventa `position: absolute; inset: 0;` e copre il parent. Due regole non negoziabili:\n\n1. Il parent DEVE avere `position: relative` (o absolute/fixed) — senza, l'immagine \"fugge\" fuori dal layout.\n2. DEVI passare `sizes`. Se ometti `sizes`, Next assume `100vw` e il browser scarica il file più grande del srcset — perdi tutto il guadagno. Il valore di `sizes` descrive quanta larghezza occuperà l'immagine a ogni breakpoint (è una media-query CSS).",
            snippet: `<div className="relative aspect-3/2-full overflow-hidden rounded-lg">
  <Image
    src="/optimization-media/responsive.jpg"
    alt="Responsive card"
    fill
    sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    className="object-cover"
  />
</div>`,
        },
        fonts: {
            heading: '§4 next/font — Sans + Mono via CSS variables',
            description:
                '`next/font/google` scarica il file `.woff2` a **build time** e lo serve dal tuo dominio (zero richieste a `fonts.gstatic.com` → privacy GDPR + zero round-trip + zero FOUT). Il pattern produzione è esporre il font come **CSS variable** (`--font-sans`, `--font-mono`) e poi consumarla da Tailwind o da CSS plain. Vantaggio: zero collisione di `className`, possibilità di fallback CSS, scoping naturale (la var vive solo dove la applichi). In questa lezione il layout di lezione monta Inter (sans) e JetBrains Mono (mono) e applica le var al wrapper — quindi i font esistono SOLO sotto `/lessons/optimization-media`.',
            snippet: `// app/lessons/optimization-media/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',   // ← espone una CSS var
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function LessonLayout({ children }) {
  return (
    <div className={\`\${sans.variable} \${mono.variable}\`}>
      {/* dentro qui: var(--font-sans) e var(--font-mono) sono disponibili */}
      {children}
    </div>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§5 Quale sorgente / layout / font usare?',
        intro: 'Tabella decisionale per la vita reale.',
        rows: [
            {
                scenario: 'Hero della home, illustrazione di brand',
                choice: 'A1 static import + B1 width/height + priority',
            },
            {
                scenario: 'Avatar utente da un CMS o S3',
                choice: 'A3 remote (con remotePatterns) + B1 width/height',
            },
            {
                scenario: 'Card in una griglia responsive',
                choice: 'A2 /public o A3 remote + B2 fill + sizes corretto',
            },
            {
                scenario: 'Icone vector (logo, social)',
                choice: 'SVG inline o /public/foo.svg (Image fa passthrough sugli SVG)',
            },
            {
                scenario: "Font UI dell'intera app",
                choice: 'next/font/google nel root layout via --font-sans',
            },
            {
                scenario: 'Font custom aziendale (non su Google Fonts)',
                choice: 'next/font/local con .woff2 in /app/fonts/',
            },
        ],
    },
    labs: {
        heading: '🧪 Lab interattivi',
        sourceDemo: {
            badge: 'Lab 1',
            description:
                'Le tre sorgenti renderizzate fianco a fianco. Apri DevTools → Network → Img e filtra per `/_next/image`: vedrai che tutte e tre passano per lo stesso endpoint di ottimizzazione (A1+A2 con `url=/...`, A3 con `url=https...`).',
        },
        layoutDemo: {
            badge: 'Lab 2',
            description:
                'A sinistra width/height espliciti, a destra fill + sizes responsive. Restringi la finestra: la card B2 scarica una variante più piccola, la B1 no. Verifica nel Network tab.',
        },
        fontDemo: {
            badge: 'Lab 3',
            description:
                'Lo stesso testo renderizzato con --font-sans e --font-mono. In Computed Styles vedi `font-family: __Inter_xxxx, __Inter_Fallback_xxxx`: il secondo è il fallback metric-adjusted che next/font genera per evitare FOUT.',
            sansLabel: 'Sans (Inter)',
            monoLabel: 'Mono (JetBrains Mono)',
            sample: 'The quick brown fox jumps over the lazy dog · 0123456789',
            codeSample: "const greeting: string = 'Ciao mondo'; // 1 + 2 === 3",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description:
            'Tutti gli step si fanno nei DevTools del browser. Niente terminale, niente curl.',
        steps: [
            "Apri DevTools → **Network** → filtra `Img`. Ricarica `/lessons/optimization-media`. Vedrai chiamate a `/_next/image?url=...&w=...&q=75`: è l'endpoint di ottimizzazione. Cliccane una e ispeziona `Response Headers`: `content-type: image/webp` (o `image/avif`) anche se il file sorgente è `.jpg`.",
            "Sempre in Network, controlla l'attributo `srcset` dell'`<img>` finale (DevTools → Elements → seleziona l'immagine). Vedi N URL con `&w=` diversi. Restringi la finestra del browser sotto 640px e ricarica: il browser sceglie la variante più piccola.",
            'Disabilita JS (DevTools → Cmd+Shift+P → "Disable JavaScript") e ricarica. Le immagini si caricano comunque (sono HTML puro), tranne `loading="lazy"` che richiede pochissimo JS — questo conferma che `next/image` è SSR-friendly.',
            '**Test CLS**: DevTools → Performance → registra il reload. Vedi un "Layout Shift" score? Per A1 e A2 (con dimensioni note) dovrebbe essere ~0. Prova a rimuovere `width`/`height` da A2 (cambia il file temporaneamente) e ricarica — vedrai lo shift.',
            '**Font check**: DevTools → Elements → seleziona un testo nel Lab 3 → Computed → cerca `font-family`. Dovresti vedere `__Inter_xxx, __Inter_Fallback_xxx, ...`. Il Fallback è la chiave: next/font genera un font system-font con metriche AGGIUSTATE per matchare Inter → niente layout shift quando Inter finisce di caricare.',
            '**Verifica self-hosting**: Network → filtra `Font`. NON vedi richieste a `fonts.gstatic.com` o `fonts.googleapis.com`. Vedi invece `/_next/static/media/xxxx.woff2` dal TUO dominio. Questo è il guadagno privacy + performance.',
            '**Test remote whitelist**: prova a mettere `src="https://example.com/x.jpg"` in `<Image>` SENZA aggiungerlo a `remotePatterns`. Errore in console: `Invalid src prop ... hostname "example.com" is not configured`. Ricorda il messaggio: in produzione è il bug #1.',
        ],
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 5 · Lesson 1',
    title: 'Images & Fonts',
    intro: '`next/image` and `next/font` are not "cute wrappers" around `<img>` and `<link rel=stylesheet>`: they are an **optimization pipeline** that runs partly at build time and partly on a server endpoint (`/_next/image`). The result: zero CLS, modern formats (WebP/AVIF) served automatically, fonts self-hosted with zero round-trip to Google. In this lesson we cover the three image sources (static import, /public, remote), the two layout strategies (width/height vs fill+sizes), and the Sans + Mono pattern via CSS variables to wire fonts into Tailwind.',
    sections: {
        pipeline: {
            heading: '§1 What actually happens when you use <Image>',
            description:
                'The final HTML is not a single `<img>`. Next generates:\n\n• An `<img>` with `srcset` listing **several sizes** of the same file (e.g. 640w/750w/828w/1080w/1200w/1920w…). The browser picks the right one based on viewport + DPR.\n• A `sizes` attribute (default `100vw` if you omit it) telling the browser how much width the image will occupy at each breakpoint.\n• HTML `width`/`height` so space is reserved → CLS = 0.\n• `loading="lazy"` by default (unless `priority`), `decoding="async"`.\n• A runtime endpoint `/_next/image?url=...&w=...&q=...` that on-demand resizes + converts to WebP/AVIF and caches it.\n\nThis is the key difference with a plain `<img>`: Next does not ship ONE file, it ships N variants tailored to the device.',
            snippet: `// Generated HTML (simplified) for: <Image src="/hero.jpg" width={1600} height={900} />
<img
  alt="..."
  loading="lazy"
  decoding="async"
  width="1600"
  height="900"
  srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w,
          /_next/image?url=%2Fhero.jpg&w=750&q=75 750w,
          /_next/image?url=%2Fhero.jpg&w=828&q=75 828w,
          /_next/image?url=%2Fhero.jpg&w=1080&q=75 1080w,
          /_next/image?url=%2Fhero.jpg&w=1200&q=75 1200w,
          /_next/image?url=%2Fhero.jpg&w=1920&q=75 1920w"
  sizes="100vw"
  src="/_next/image?url=%2Fhero.jpg&w=1920&q=75"
/>`,
        },
        sourceA1: {
            heading: '§2 Source A1 — Static import',
            description:
                "Direct file import is the most powerful mode: Next reads the file at **build time**, derives intrinsic `width`/`height`, and generates a `blurDataURL` (10×10 base64) used as a load-time blur-up. The `<Image src={obj} />` receives a `StaticImageData` object, not a string. Result: ZERO config, CLS = 0, free blur-up. Limit: only for files co-located with code (hero, illustrations, brand assets) — you can't import UGC or CMS content.",
            snippet: `// app/lessons/optimization-media/_components/image-source-demo.tsx
import Image from 'next/image';
import hero from '../_assets/hero.jpg'; // ← StaticImageData, NOT a string

<Image
  src={hero}            // contains width, height, blurDataURL
  alt="Mountain hero"
  placeholder="blur"    // ← free, thanks to the static import
  sizes="(max-width: 768px) 100vw, 800px"
  priority              // ← LCP candidate: preload + no lazy-load
/>`,
        },
        sourceA2: {
            heading: '§2.1 Source A2 — Path string from /public',
            description:
                'The file lives at `/public/optimization-media/avatar.jpg` and is referenced as the string `"/optimization-media/avatar.jpg"`. Next does NOT know the intrinsic dimensions at build time → you MUST pass explicit `width`/`height`. This is the classic pattern for "hosted but fixed" assets (favicon, logo, marketing imagery). No automatic blur: if you want one, you must generate and pass `blurDataURL` yourself.',
            snippet: `// Path string — the file lives at /public/optimization-media/avatar.jpg
import Image from 'next/image';

<Image
  src="/optimization-media/avatar.jpg"   // ← string, relative to /public
  alt="Avatar"
  width={120}                            // ← required
  height={120}                           // ← required
  className="rounded-full"
/>`,
        },
        sourceA3: {
            heading: '§2.2 Source A3 — Remote URL (CMS / S3 / CDN)',
            description:
                'The src is an absolute URL. To avoid turning your `/_next/image` endpoint into an open proxy (DoS, SSRF, hot-link laundering), Next blocks anything not listed in `remotePatterns` of `next.config.ts`. Typical error: "Invalid src prop... hostname is not configured". Fix: add the pattern. With no build-time dimensions, you pass `width`/`height` or use `fill`. In this lesson we whitelisted `picsum.photos`.',
            snippet: `// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
  ],
}

// Component
<Image
  src="https://picsum.photos/seed/notebook-remote/1200/600"
  alt="Remote (Lorem Picsum)"
  width={1200}
  height={600}
  unoptimized={false}   // default: goes through /_next/image (resize + WebP)
/>`,
        },
        layoutB1: {
            heading: '§3 Layout B1 — explicit width/height',
            description:
                'Aspect-ratio is derived from `width/height`, and the HTML height is reserved BEFORE the image loads → CLS = 0. Use this when you know the intrinsic size (hero, avatar, screenshot, illustration). HTML dimensions do not drive the rendered size: you can always override with CSS (`className="w-full h-auto"`). What matters is the aspect ratio.',
            snippet: `<Image
  src={hero}
  alt="Hero"
  // width/height come from the static import; for /public + remote you pass them
  className="w-full h-auto rounded-lg"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>`,
        },
        layoutB2: {
            heading: '§3.1 Layout B2 — fill + sizes',
            description:
                'When the image must **fit the container** (card in a responsive grid, viewport-filling hero), explicit `width`/`height` are not enough. Use `fill`: the image becomes `position: absolute; inset: 0;` and covers the parent. Two non-negotiable rules:\n\n1. The parent MUST have `position: relative` (or absolute/fixed) — without it, the image "escapes" the layout.\n2. You MUST pass `sizes`. If you omit it, Next assumes `100vw` and the browser fetches the largest srcset entry — you lose the whole win. The `sizes` value describes how much width the image will occupy at each breakpoint (it\'s a CSS media query).',
            snippet: `<div className="relative aspect-3/2 w-full overflow-hidden rounded-lg">
  <Image
    src="/optimization-media/responsive.jpg"
    alt="Responsive card"
    fill
    sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    className="object-cover"
  />
</div>`,
        },
        fonts: {
            heading: '§4 next/font — Sans + Mono via CSS variables',
            description:
                '`next/font/google` downloads the `.woff2` file at **build time** and serves it from your own domain (zero requests to `fonts.gstatic.com` → GDPR-friendly + zero round-trip + zero FOUT). The production pattern is to expose the font as a **CSS variable** (`--font-sans`, `--font-mono`) and consume it from Tailwind or plain CSS. Benefits: no `className` collisions, CSS-level fallback, natural scoping (the var only lives where you apply it). In this lesson the lesson layout mounts Inter (sans) and JetBrains Mono (mono) and applies the variables to its wrapper — so the fonts only exist under `/lessons/optimization-media`.',
            snippet: `// app/lessons/optimization-media/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',   // ← exposes a CSS var
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function LessonLayout({ children }) {
  return (
    <div className={\`\${sans.variable} \${mono.variable}\`}>
      {/* inside here: var(--font-sans) and var(--font-mono) are available */}
      {children}
    </div>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§5 Which source / layout / font to use?',
        intro: 'Real-world decision table.',
        rows: [
            {
                scenario: 'Home page hero, brand illustration',
                choice: 'A1 static import + B1 width/height + priority',
            },
            {
                scenario: 'User avatar from a CMS or S3',
                choice: 'A3 remote (with remotePatterns) + B1 width/height',
            },
            {
                scenario: 'Card in a responsive grid',
                choice: 'A2 /public or A3 remote + B2 fill + correct sizes',
            },
            {
                scenario: 'Vector icons (logo, social)',
                choice: 'Inline SVG or /public/foo.svg (Image passes SVGs through)',
            },
            {
                scenario: 'App-wide UI font',
                choice: 'next/font/google in the root layout via --font-sans',
            },
            {
                scenario: 'Custom corporate font (not on Google Fonts)',
                choice: 'next/font/local with .woff2 in /app/fonts/',
            },
        ],
    },
    labs: {
        heading: '🧪 Interactive labs',
        sourceDemo: {
            badge: 'Lab 1',
            description:
                'The three sources rendered side by side. Open DevTools → Network → Img and filter by `/_next/image`: all three go through the same optimization endpoint (A1+A2 with `url=/...`, A3 with `url=https...`).',
        },
        layoutDemo: {
            badge: 'Lab 2',
            description:
                'Left: explicit width/height. Right: fill + responsive sizes. Shrink the window: card B2 fetches a smaller variant, B1 does not. Verify in the Network tab.',
        },
        fontDemo: {
            badge: 'Lab 3',
            description:
                'The same text rendered with --font-sans and --font-mono. In Computed Styles you will see `font-family: __Inter_xxxx, __Inter_Fallback_xxxx`: the second is the metric-adjusted fallback that next/font generates to avoid FOUT.',
            sansLabel: 'Sans (Inter)',
            monoLabel: 'Mono (JetBrains Mono)',
            sample: 'The quick brown fox jumps over the lazy dog · 0123456789',
            codeSample:
                "const greeting: string = 'Hello world'; // 1 + 2 === 3",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description:
            'All steps happen in browser DevTools. No terminal, no curl.',
        steps: [
            "Open DevTools → **Network** → filter by `Img`. Reload `/lessons/optimization-media`. You will see calls to `/_next/image?url=...&w=...&q=75`: that's the optimization endpoint. Click one and inspect `Response Headers`: `content-type: image/webp` (or `image/avif`) even though the source file is `.jpg`.",
            'Still in Network, check the `srcset` attribute on the final `<img>` (DevTools → Elements → select the image). You will see N URLs with different `&w=`. Shrink the browser below 640px and reload: the browser picks the smaller variant.',
            'Disable JS (DevTools → Cmd+Shift+P → "Disable JavaScript") and reload. The images still load (they are plain HTML), except `loading="lazy"` requires a tiny bit of JS — confirming `next/image` is SSR-friendly.',
            '**CLS test**: DevTools → Performance → record a reload. See a "Layout Shift" score? For A1 and A2 (known dimensions) it should be ~0. Temporarily remove `width`/`height` from A2 and reload — you will see the shift.',
            '**Font check**: DevTools → Elements → select text in Lab 3 → Computed → search for `font-family`. You should see `__Inter_xxx, __Inter_Fallback_xxx, ...`. The Fallback is the key: next/font generates a system-font with ADJUSTED metrics matching Inter → no layout shift when Inter finishes loading.',
            "**Verify self-hosting**: Network → filter by `Font`. You see NO requests to `fonts.gstatic.com` or `fonts.googleapis.com`. You see instead `/_next/static/media/xxxx.woff2` from YOUR domain. That's the privacy + performance win.",
            '**Remote whitelist test**: try setting `src="https://example.com/x.jpg"` on `<Image>` WITHOUT adding it to `remotePatterns`. Console error: `Invalid src prop ... hostname "example.com" is not configured`. Remember this message: it\'s the #1 bug in production.',
        ],
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 5 · Лекція 1',
    title: 'Зображення та шрифти',
    intro: "`next/image` та `next/font` — це не «милі обгортки» навколо `<img>` і `<link rel=stylesheet>`: це **конвеєр оптимізації**, який працює частково на build time і частково на серверному endpoint (`/_next/image`). Результат: нульовий CLS, сучасні формати (WebP/AVIF) автоматично, шрифти self-hosted без жодного запиту до Google. У цій лекції розглядаємо три джерела зображень (static import, /public, remote), дві стратегії layout (width/height vs fill+sizes), і патерн Sans + Mono через CSS variables для зв'язки шрифтів із Tailwind.",
    sections: {
        pipeline: {
            heading:
                '§1 Що насправді відбувається, коли ти використовуєш <Image>',
            description:
                'Фінальний HTML — не один `<img>`. Next генерує:\n\n• `<img>` із `srcset`, який перелічує **кілька розмірів** того ж файлу (наприклад 640w/750w/828w/1080w/1200w/1920w…). Браузер вибирає потрібний на основі viewport + DPR.\n• Атрибут `sizes` (за замовчуванням `100vw`, якщо пропустити), який каже браузеру, скільки ширини займатиме зображення на кожному breakpoint.\n• HTML `width`/`height` — простір зарезервовано → CLS = 0.\n• `loading="lazy"` за замовчуванням (крім `priority`), `decoding="async"`.\n• Runtime endpoint `/_next/image?url=...&w=...&q=...`, який on-demand робить resize + конвертацію у WebP/AVIF і кешує результат.\n\nКлючова відмінність від звичайного `<img>`: Next не віддає ОДИН файл, він віддає N варіантів під пристрій.',
            snippet: `// Згенерований HTML (спрощено) для: <Image src="/hero.jpg" width={1600} height={900} />
<img
  alt="..."
  loading="lazy"
  decoding="async"
  width="1600"
  height="900"
  srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w,
          /_next/image?url=%2Fhero.jpg&w=750&q=75 750w,
          /_next/image?url=%2Fhero.jpg&w=828&q=75 828w,
          /_next/image?url=%2Fhero.jpg&w=1080&q=75 1080w,
          /_next/image?url=%2Fhero.jpg&w=1200&q=75 1200w,
          /_next/image?url=%2Fhero.jpg&w=1920&q=75 1920w"
  sizes="100vw"
  src="/_next/image?url=%2Fhero.jpg&w=1920&q=75"
/>`,
        },
        sourceA1: {
            heading: '§2 Джерело A1 — Static import',
            description:
                "Прямий import файлу — найпотужніший режим: Next читає файл на **build time**, отримує внутрішні `width`/`height` та генерує `blurDataURL` (10×10 base64), який використовується як blur-up на час завантаження. Компонент `<Image src={obj} />` отримує об\'єкт `StaticImageData`, а не рядок. Результат: НУЛЬ конфігурації, CLS = 0, безкоштовний blur-up. Обмеження: лише для файлів, що поставляються з кодом (hero, ілюстрації, brand assets) — UGC чи контент із CMS так не імпортуєш.",
            snippet: `// app/lessons/optimization-media/_components/image-source-demo.tsx
import Image from 'next/image';
import hero from '../_assets/hero.jpg'; // ← StaticImageData, НЕ рядок

<Image
  src={hero}            // містить width, height, blurDataURL
  alt="Гірський hero"
  placeholder="blur"    // ← безкоштовно завдяки static import
  sizes="(max-width: 768px) 100vw, 800px"
  priority              // ← LCP-кандидат: preload + без lazy-load
/>`,
        },
        sourceA2: {
            heading: '§2.1 Джерело A2 — Path string з /public',
            description:
                'Файл живе в `/public/optimization-media/avatar.jpg` і вказується як рядок `"/optimization-media/avatar.jpg"`. Next НЕ знає внутрішніх розмірів на build time → ОБОВ\'ЯЗКОВО передаєш `width`/`height`. Класичний патерн для «розміщених, але фіксованих» asset\'ів (favicon, лого, маркетингові зображення). Без автоматичного blur: якщо хочеш — генеруй і передавай `blurDataURL` сам.',
            snippet: `// Path string — файл живе в /public/optimization-media/avatar.jpg
import Image from 'next/image';

<Image
  src="/optimization-media/avatar.jpg"   // ← рядок, відносно /public
  alt="Аватар"
  width={120}                            // ← обов'язково
  height={120}                           // ← обов'язково
  className="rounded-full"
/>`,
        },
        sourceA3: {
            heading: '§2.2 Джерело A3 — Remote URL (CMS / S3 / CDN)',
            description:
                'src — абсолютний URL. Щоб твій endpoint `/_next/image` не перетворився на відкритий проксі (DoS, SSRF, hot-link laundering), Next блокує все, чого немає в `remotePatterns` у `next.config.ts`. Типова помилка: "Invalid src prop... hostname is not configured". Виправлення: додай патерн. Без build-time-розмірів — теж передаєш `width`/`height` або використовуєш `fill`. У цій лекції в whitelist додано `picsum.photos`.',
            snippet: `// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
  ],
}

// Компонент
<Image
  src="https://picsum.photos/seed/notebook-remote/1200/600"
  alt="Remote (Lorem Picsum)"
  width={1200}
  height={600}
  unoptimized={false}   // за замовчуванням: проходить через /_next/image (resize + WebP)
/>`,
        },
        layoutB1: {
            heading: '§3 Layout B1 — явні width/height',
            description:
                'Aspect-ratio виводиться з `width/height`, HTML-висота зарезервована ДО завантаження зображення → CLS = 0. Використовуй коли знаєш внутрішній розмір (hero, аватар, скріншот, ілюстрація). HTML-розміри не визначають реальний рендер: завжди можеш перевизначити CSS (`className="w-full h-auto"`). Важлива саме aspect-ratio.',
            snippet: `<Image
  src={hero}
  alt="Hero"
  // width/height приходять зі static import; для /public + remote ти їх передаєш
  className="w-full h-auto rounded-lg"
  sizes="(max-width: 768px) 100vw, 800px"
  priority
/>`,
        },
        layoutB2: {
            heading: '§3.1 Layout B2 — fill + sizes',
            description:
                "Коли зображення мусить **підлаштуватися під контейнер** (картка у responsive grid, hero на весь viewport), явних `width`/`height` мало. Використовуй `fill`: зображення стає `position: absolute; inset: 0;` і покриває батька. Два непорушні правила:\n\n1. Батько ОБОВ\'ЯЗКОВО має `position: relative` (або absolute/fixed) — без цього зображення «втече» з layout.\n2. ОБОВ\'ЯЗКОВО передавай `sizes`. Якщо пропустити — Next припускає `100vw`, і браузер скачає найбільший варіант srcset → весь виграш втрачено. Значення `sizes` описує, скільки ширини займе зображення на кожному breakpoint (це CSS media query).",
            snippet: `<div className="relative aspect-3/2 w-full overflow-hidden rounded-lg">
  <Image
    src="/optimization-media/responsive.jpg"
    alt="Responsive card"
    fill
    sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    className="object-cover"
  />
</div>`,
        },
        fonts: {
            heading: '§4 next/font — Sans + Mono через CSS variables',
            description:
                '`next/font/google` завантажує файл `.woff2` на **build time** і віддає його з твого домену (нуль запитів до `fonts.gstatic.com` → privacy GDPR + нуль round-trip + нуль FOUT). Production-патерн: експонувати шрифт як **CSS variable** (`--font-sans`, `--font-mono`) і споживати з Tailwind чи plain CSS. Переваги: нуль колізій `className`, fallback на CSS-рівні, природний scoping (var живе лише там, де ти її застосовуєш). У цій лекції layout лекції монтує Inter (sans) і JetBrains Mono (mono) і застосовує variables до свого wrapper — отже, шрифти існують ЛИШЕ під `/lessons/optimization-media`.',
            snippet: `// app/lessons/optimization-media/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',   // ← виставляє CSS var
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function LessonLayout({ children }) {
  return (
    <div className={\`\${sans.variable} \${mono.variable}\`}>
      {/* тут: var(--font-sans) і var(--font-mono) доступні */}
      {children}
    </div>
  );
}`,
        },
    },
    decisionTable: {
        heading: '§5 Яке джерело / layout / шрифт обрати?',
        intro: 'Таблиця рішень для реального життя.',
        rows: [
            {
                scenario: 'Hero головної, brand-ілюстрація',
                choice: 'A1 static import + B1 width/height + priority',
            },
            {
                scenario: 'Аватар користувача з CMS або S3',
                choice: 'A3 remote (з remotePatterns) + B1 width/height',
            },
            {
                scenario: 'Картка в responsive grid',
                choice: 'A2 /public або A3 remote + B2 fill + правильний sizes',
            },
            {
                scenario: 'Vector icons (лого, social)',
                choice: 'Inline SVG або /public/foo.svg (Image робить passthrough для SVG)',
            },
            {
                scenario: 'UI-шрифт всієї app',
                choice: 'next/font/google в root layout через --font-sans',
            },
            {
                scenario: 'Кастомний корпоративний шрифт (не на Google Fonts)',
                choice: 'next/font/local з .woff2 у /app/fonts/',
            },
        ],
    },
    labs: {
        heading: '🧪 Інтерактивні лабораторії',
        sourceDemo: {
            badge: 'Лаб 1',
            description:
                'Три джерела поруч. DevTools → Network → Img, фільтр `/_next/image`: усі три проходять через той самий endpoint оптимізації (A1+A2 з `url=/...`, A3 з `url=https...`).',
        },
        layoutDemo: {
            badge: 'Лаб 2',
            description:
                'Зліва явні width/height, справа fill + responsive sizes. Звужуй вікно: картка B2 завантажить менший варіант, B1 — ні. Перевір у Network tab.',
        },
        fontDemo: {
            badge: 'Лаб 3',
            description:
                'Той самий текст із --font-sans і --font-mono. У Computed Styles побачиш `font-family: __Inter_xxxx, __Inter_Fallback_xxxx`: другий — це metric-adjusted fallback, який next/font генерує проти FOUT.',
            sansLabel: 'Sans (Inter)',
            monoLabel: 'Mono (JetBrains Mono)',
            sample: 'The quick brown fox jumps over the lazy dog · 0123456789',
            codeSample:
                "const greeting: string = 'Привіт світ'; // 1 + 2 === 3",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description:
            'Усі кроки — в DevTools браузера. Жодного терміналу, жодного curl.',
        steps: [
            'DevTools → **Network** → фільтр `Img`. Перезавантаж `/lessons/optimization-media`. Побачиш виклики `/_next/image?url=...&w=...&q=75` — це endpoint оптимізації. Клікни один і подивись `Response Headers`: `content-type: image/webp` (або `image/avif`), навіть якщо вихідний файл — `.jpg`.',
            'Все ще в Network: подивись атрибут `srcset` фінального `<img>` (DevTools → Elements → виділи зображення). Побачиш N URL з різними `&w=`. Звузь вікно браузера до <640px і перезавантаж: браузер обере менший варіант.',
            'Вимкни JS (DevTools → Cmd+Shift+P → "Disable JavaScript") і перезавантаж. Зображення все одно завантажуються (це чистий HTML), крім `loading="lazy"`, який потребує крихітний JS — це підтверджує, що `next/image` SSR-friendly.',
            '**Тест CLS**: DevTools → Performance → запиши reload. Бачиш "Layout Shift" score? Для A1 і A2 (відомі розміри) має бути ~0. Тимчасово прибери `width`/`height` з A2 і перезавантаж — побачиш зсув.',
            '**Перевірка шрифту**: DevTools → Elements → виділи текст у Лаб 3 → Computed → шукай `font-family`. Має бути `__Inter_xxx, __Inter_Fallback_xxx, ...`. Fallback — ключ: next/font генерує системний шрифт із метриками, ПІДЛАШТОВАНИМИ під Inter → нуль layout shift, коли Inter дозавантажиться.',
            '**Перевірка self-hosting**: Network → фільтр `Font`. НЕМАЄ запитів до `fonts.gstatic.com` чи `fonts.googleapis.com`. Натомість — `/_next/static/media/xxxx.woff2` з ТВОГО домену. Це і є приз: privacy + performance.',
            '**Тест remote whitelist**: спробуй передати `src="https://example.com/x.jpg"` в `<Image>` БЕЗ додавання до `remotePatterns`. Помилка в консолі: `Invalid src prop ... hostname "example.com" is not configured`. Запам\'ятай це повідомлення — це бул #1 у production.',
        ],
    },
};

// -----------------------------------------------------------------------------
// Public map keyed by Lang. Used by <IndexView> via `useLang()`.
// -----------------------------------------------------------------------------
export const content: Record<Lang, Dictionary> = { it, en, uk };
