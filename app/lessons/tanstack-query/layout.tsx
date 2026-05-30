// =============================================================================
// app/lessons/tanstack-query/layout.tsx
// Server layout for /lessons/tanstack-query. Mounts the client QueryProvider
// so every component under this route shares one QueryClient instance.
// =============================================================================

import { QueryProvider } from './_components/query-provider';

export default function TanstackQueryLayout({
    children,
}: LayoutProps<'/lessons/tanstack-query'>) {
    return <QueryProvider>{children}</QueryProvider>;
}
