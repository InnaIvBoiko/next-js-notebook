// =============================================================================
// app/lessons/database-orm/layout.tsx
// Server layout for /lessons/database-orm — mounts the Client QueryProvider
// so LAB 3 (ClientNotesList) can use useQuery + benefit from the page-level
// HydrationBoundary in page.tsx.
// -----------------------------------------------------------------------------
// 🧠 Cross-lesson import — and why it's OK here
// We reuse the `QueryProvider` originally written for Module 3 · Lesson 3.
// In a production codebase this provider would live in a shared module (e.g.
// `app/lessons/_components/query-provider.tsx`) since multiple lessons now
// need it. We deliberately keep the original location to avoid touching a
// finished lesson's tree mid-course; a future lesson that needs it again
// will be the right moment to promote it.
// =============================================================================

import { QueryProvider } from '../tanstack-query/_components/query-provider';

export default function DatabaseOrmLayout({
    children,
}: LayoutProps<'/lessons/database-orm'>) {
    return <QueryProvider>{children}</QueryProvider>;
}
