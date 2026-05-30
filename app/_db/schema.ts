// =============================================================================
// app/_db/schema.ts
// Drizzle ORM schema — shared by Module 4 · Lessons 2 & 3.
// -----------------------------------------------------------------------------
// 🧠 Tables in this file
//
//   notes  (id PK, title, body, createdAt, userId? → users.id)
//     ↓ one
//   note_tags  (id PK, noteId FK → notes.id, label)
//
//   users           — Auth.js users + our `passwordHash` for Credentials
//   accounts        — OAuth account links (one user can have many providers)
//   sessions        — Database-backed sessions (used by GitHub OAuth)
//   verificationTokens — Email magic-link tokens (unused but part of the adapter contract)
//
// The auth tables (users / accounts / sessions / verificationTokens) follow
// the exact shape required by `@auth/drizzle-adapter` for Postgres. Column
// names are camelCase in the ADAPTER's expectation, so we keep the SQL names
// matching ("emailVerified", "sessionToken", ...).
//
// 🧠 notes.userId is NULLABLE on purpose
// Notes from Lesson 1/2 were created without an owner. We don't want to
// retroactively assign them. New notes created from /lessons/auth-setup
// (logged-in flow) carry the userId; the public CRUD of Lesson 2 keeps
// inserting NULL.
//
// 📚 Doc: https://authjs.dev/getting-started/adapters/drizzle
// =============================================================================

import { relations } from 'drizzle-orm';
import {
    integer,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

// -----------------------------------------------------------------------------
// AUTH TABLES (Auth.js v5 Drizzle adapter contract)
// -----------------------------------------------------------------------------

export const users = pgTable('user', {
    // Auth.js generates `crypto.randomUUID()` ids — column is TEXT, not UUID,
    // for portability with adapters that don't have native UUID support.
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: timestamp('emailVerified', {
        mode: 'date',
        withTimezone: true,
    }),
    image: text('image'),
    // 🆕 Our addition — the Credentials provider stores its bcrypt hash here.
    // OAuth-only users don't have one (NULL); they sign in via the GitHub
    // flow and never need a password.
    passwordHash: text('password_hash'),
});

export const accounts = pgTable(
    'account',
    {
        userId: text('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        // 'oauth' | 'oidc' | 'email' | 'credentials' — discriminates the row.
        type: text('type').notNull(),
        provider: text('provider').notNull(),
        // The provider's own user id (e.g. GitHub numeric id as string).
        providerAccountId: text('providerAccountId').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    account => ({
        // Composite PK: a user can link multiple OAuth providers, but each
        // (provider, providerAccountId) pair is unique.
        pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
    }),
);

export const sessions = pgTable('session', {
    sessionToken: text('sessionToken').primaryKey(),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
    'verificationToken',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
    },
    vt => ({
        pk: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

// -----------------------------------------------------------------------------
// DOMAIN TABLES
// -----------------------------------------------------------------------------

export const notes = pgTable('notes', {
    // `serial` = Postgres SERIAL = auto-increment integer PK. Kept from
    // Lesson 1/2 — IDs were already exposed in the UI, so we don't migrate
    // to UUID retroactively.
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
    // 🆕 NULLABLE owner. Pre-existing notes (and the public CRUD of Lesson 2)
    // keep NULL; the protected CRUD of /lessons/auth-setup writes the
    // signed-in user's id. The decision table in the lesson explains the
    // trade-off vs. making it NOT NULL.
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
});

export const noteTags = pgTable('note_tags', {
    id: serial('id').primaryKey(),
    noteId: integer('note_id')
        .notNull()
        .references(() => notes.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
});

// -----------------------------------------------------------------------------
// RELATIONS — wired ONCE, used by Drizzle's relational query helpers.
// -----------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    notes: many(notes),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const notesRelations = relations(notes, ({ many, one }) => ({
    tags: many(noteTags),
    // Optional owner — `findMany({ with: { owner: true } })` will return
    // `owner: User | null` because notes.userId is nullable.
    owner: one(users, { fields: [notes.userId], references: [users.id] }),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
    note: one(notes, {
        fields: [noteTags.noteId],
        references: [notes.id],
    }),
}));

// -----------------------------------------------------------------------------
// TYPES — inferred from the schema.
// -----------------------------------------------------------------------------

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;
export type NoteWithTags = Note & { tags: NoteTag[] };
export type NoteWithTagsAndOwner = NoteWithTags & {
    owner: typeof users.$inferSelect | null;
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
