// =============================================================================
// app/page.tsx — Living Notebook HOME
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This file does NOT carry the `'use client'` directive: it is therefore a
// **Server Component** (the default in the App Router). It runs ONLY on the
// server and its code is NOT shipped in the client bundle.
//
// Its only job is to import and render `<NotebookShell />`, which IS a Client
// Component (see `_components/notebook-shell.tsx`). This is the classic
// "Server entry → Client island" pattern: the route file stays Server, and
// interactivity is confined to a Client island.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
// =============================================================================

import NotebookShell from "./_components/notebook-shell";

export default function HomePage() {
  return <NotebookShell />;
}
