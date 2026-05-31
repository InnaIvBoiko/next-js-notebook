# Contributing

Thanks for considering a contribution! This is a personal learning notebook by Inna Boiko, but PRs that fix bugs, improve a lesson, or add a missing language translation are very welcome.

---

## Quick links

- [README.md](./README.md) — what the project is and how to run it
- [ARCHITECTURE.md](./ARCHITECTURE.md) — deep technical notes
- [.env.example](./.env.example) — environment variables template

---

## Before you open a PR

1. **Open an issue first** for anything beyond a typo fix or a 5-line change. Lessons have a deliberate teaching arc and design choices that aren't obvious from the code alone.
2. **Run the local checks**:
   ```bash
   npm run lint && npx tsc --noEmit && npm run build
   ```
   All three must pass. CI runs the same.
3. **Match the existing style**:
   - English in code comments and commit messages (always, even if the lesson copy is Italian).
   - Tailwind v4 canonical forms (`shrink-0`, not `flex-shrink-0`; `font-(family-name:--font-mono)` to disambiguate from `font-bold`).
   - No `any`. Use `unknown` + a type guard if the shape is genuinely dynamic.

---

## Anatomy of a lesson

Every lesson under `app/lessons/<slug>/` follows the same skeleton:

```
app/lessons/<slug>/
├── page.tsx                    ← Server entry (Server Component by default)
├── _components/
│   ├── index-view.tsx          ← Client orchestrator (uses useLang())
│   └── <feature>.tsx           ← UI islands (Server OR Client, as needed)
└── _lib/
    └── content.ts              ← IT/EN/UK dictionary for this lesson
```

### Roles

- **`page.tsx`** (Server): does server-only work (DB, fs, env, `headers()`/`cookies()`), then renders `<IndexView>` passing any computed results as `ReactNode` slots.
- **`_components/index-view.tsx`** (Client): reads `useLang()` from the global `LangProvider`, picks the right dictionary, renders theory sections + lab slots received as props.
- **`_lib/content.ts`** (no directive): exports `content: Record<Lang, Dictionary>`. The `Dictionary` type lives at the top of the file and is enforced for all 3 languages — TypeScript guarantees no missing keys.

### Lab components

Three flavors, pick whichever fits:

| Flavor | When to use | Example |
| ------ | ----------- | ------- |
| Server slot | Reads fs / env / DB; no interactivity | [`build-marker-viewer.tsx`](app/lessons/deploy-ready/_components/build-marker-viewer.tsx) |
| Client island | Needs state, effects, refs, or browser APIs | [`runtime-probe-card.tsx`](app/lessons/deploy-ready/_components/runtime-probe-card.tsx) |
| Server + Client mix | Initial data on server, interactivity on client | [`webhook-demo.tsx`](app/lessons/security-env/_components/webhook-demo.tsx) |

---

## Adding a new lesson

If we ever extend beyond 20:

1. **Pick the slug** — short, hyphen-cased, matches the topic. Add it to the roadmap in [`app/_lib/dictionaries.ts`](app/_lib/dictionaries.ts) under the right module (×3 languages).
2. **Create the folder structure** above. Copy from a similar existing lesson as a starting point — `/lessons/deploy-ready/` is a good template for a static lesson with labs.
3. **Write the dictionary** in `_lib/content.ts` with all three languages. The IT version is the base; EN and UK are translations.
4. **Wire up the slots** in `page.tsx`. Read any server-side data, pass as `ReactNode` to `<IndexView>`.
5. **Update the home roadmap status** from `'locked'` to `'done'` (×3 languages) in `app/_lib/dictionaries.ts`.
6. **Update the sitemap** if needed — it iterates the dictionaries module list, so it should auto-pick the new lesson.
7. **Run `npm run build`** and confirm the new route shows up in the route table (with the marker you expect: ○ / ◐ / λ).

---

## Adding a translation

Two cases:

### A new language across the whole notebook

Substantial work — every lesson has its own `content.ts`. Open an issue first to discuss. The work is:
1. Extend `Lang` type and `LANGS` array in [`app/_lib/dictionaries.ts`](app/_lib/dictionaries.ts).
2. Add the language to every per-lesson `content.ts` Dictionary.
3. Update [`proxy.ts`](proxy.ts) `Accept-Language` sniffing to recognize the new code.

### Improving an existing translation

Welcome and easy — open a PR with the corrected `content.ts` entries. Keep the keys exactly the same (TypeScript will yell if you miss one).

---

## Commit messages

The repo's commit log is a teaching artifact too. Style:

```
Add Module X · Lesson Y: <Title> — <concise summary of what + why in one paragraph>
```

Examples in [`git log`](https://github.com/InnaIvBoiko/next-js-notebook/commits/main):
- "Add Module 5 · Lesson 5: Deploy-Ready — build anatomy (...)"
- "Add Module 5 · Lesson 4: Advanced Routing (parallel routes, intercepting modal, ...)"

For bug fixes:
```
Fix <component>: <what was wrong, what now works>
```

Always English, even in IT-only conversations.

---

## Code style

### TypeScript

- Strict mode (already on in `tsconfig.json`).
- Prefer `type` aliases over `interface` unless you need declaration merging.
- Function signatures with destructured props and inline type:
  ```tsx
  function Card({ title, body }: { title: string; body: string }) { … }
  ```

### React

- Server Components by default. Add `'use client'` only when you actually need state, effects, or browser APIs.
- Avoid `useEffect` for data fetching — use Server Components or React 19's `use()` instead.
- Split Context into Read + Write providers when one consumer doesn't care about the other's updates (see [`lang-provider.tsx`](app/lessons/_components/lang-provider.tsx)).

### CSS / Tailwind

- Tailwind v4 utility classes. No custom CSS unless it's truly impossible (CSS variables, custom font definitions).
- Dark/slate theme is the default. Use `slate-950` / `slate-900` / `slate-800` for backgrounds, `slate-100` / `slate-200` / `slate-400` for text.
- Accent colors per lesson: `sky` (info), `emerald` (success), `violet` (highlight), `amber` (warn/lab badge), `rose` (error/debug).

### Comments

- **Required**: comments explaining WHY a non-obvious choice was made (hidden constraints, workarounds for specific bugs, edge cases).
- **Discouraged**: comments that just describe WHAT the code does (well-named identifiers do that).
- **Lesson comments**: the inline `// 🧠 ARCHITECTURE` blocks in lesson files are part of the teaching content — keep them.

---

## Local development tips

### Reset the in-memory DB

PGlite is in-memory; stop & restart the dev server to wipe it. Mock seed data lives in `app/api/_db/`.

### Edit a translation

Translations are inline in each lesson's `_lib/content.ts`. Hot-reload picks up changes immediately. To switch languages while developing, click the IT/EN/UK chip in the header — it writes `nb-lang` to cookies.

### Test at 320px

```bash
# In Chrome DevTools: toggle device toolbar (⌘⇧M / Ctrl+Shift+M)
# Pick "Responsive" → manually set 320 × 568
```

Or open the app from another device on the same WiFi — see `allowedDevOrigins` in [`next.config.ts`](next.config.ts).

### Debug Cache Components decisions

After `npm run build`, the terminal table marks every route with `○` / `◐` / `λ`. Lesson 20's Build-marker viewer reads the same data from `.next/prerender-manifest.json` and renders it in-app.

---

## License

By contributing you agree your changes are released under the same MIT license as the rest of the project.

---

Questions? Open an issue or reach out: [inna_boiko@libero.it](mailto:inna_boiko@libero.it).
