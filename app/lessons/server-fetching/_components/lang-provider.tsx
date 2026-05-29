// =============================================================================
// app/lessons/server-fetching/_components/lang-provider.tsx
// Thin re-export of the SHARED language context, which now lives at
// app/lessons/_components/lang-provider.tsx and is mounted once in
// app/lessons/layout.tsx. See /lessons/context-provider for the lift refactor.
// =============================================================================

export { useLessonLang } from '../../_components/lang-provider';
