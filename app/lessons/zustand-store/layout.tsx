// =============================================================================
// app/lessons/zustand-store/layout.tsx
// SHARED LAYOUT for /lessons/zustand-store — mounts the TodoStoreProvider so
// that every component under this route reads from the SAME store instance.
// -----------------------------------------------------------------------------
// 🧠 Two stores, two strategies
//   • Theme store: module-scoped — needs NO provider, the hook works as-is
//   • Todo store: factory + provider — needs <TodoStoreProvider> in scope
//
// Mounting the provider in the layout (not in page.tsx) keeps the same store
// instance alive across any future sub-routes added under /lessons/zustand-store.
//
// This file is a Server Component; <TodoStoreProvider> is the 'use client'
// boundary. Server can host the provider as children — same pattern as the
// LangProvider in /lessons/layout.tsx.
// =============================================================================

import { TodoStoreProvider } from './_components/todo-store';

export default function ZustandStoreLayout({
    children,
}: LayoutProps<'/lessons/zustand-store'>) {
    return <TodoStoreProvider>{children}</TodoStoreProvider>;
}
