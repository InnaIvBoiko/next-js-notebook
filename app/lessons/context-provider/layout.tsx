// =============================================================================
// app/lessons/context-provider/layout.tsx
// SHARED LAYOUT for /lessons/context-provider.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This Server layout exists for ONE reason: it owns the local ThemeProvider
// boundary for the lab demo. Putting the provider in the layout (instead of
// in page.tsx) means the React tree of the provider — and the useState that
// holds the current theme — is preserved across navigation between the
// lesson page and any future sub-route we add under /lessons/context-provider.
//
// Compare with the LangProvider, which lives one level up at
// app/lessons/layout.tsx because language is shared across the WHOLE notebook,
// while the theme is scoped to this lesson only. Provider placement is the
// whole subject of §2 of the lesson.
//
// This file is a Server Component. It only renders markup around a Client
// provider boundary (`<ThemeProvider>` is the boundary, imported from a
// 'use client' module).
// =============================================================================

import { ThemeProvider } from './_components/theme-provider';

export default function ContextProviderLayout({
    children,
}: LayoutProps<'/lessons/context-provider'>) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
