// =============================================================================
// app/api/auth/[...nextauth]/route.ts
// Auth.js v5 catch-all route. Mounts at /api/auth/*.
// -----------------------------------------------------------------------------
// 🧠 Routes this single file implements:
//   GET  /api/auth/session          — current session as JSON
//   GET  /api/auth/providers        — list of configured providers
//   GET  /api/auth/csrf             — CSRF token used by signin POSTs
//   POST /api/auth/signin/:provider — start sign-in flow
//   GET  /api/auth/callback/:provider — OAuth callback target
//   POST /api/auth/signout          — sign-out
//   GET  /api/auth/error            — auth error page
//
// `handlers` is the `{ GET, POST }` pair Auth.js synthesises from our config.
// =============================================================================

import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
