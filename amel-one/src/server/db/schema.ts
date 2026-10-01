import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  jsonb,
  unique,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
export const organizations = pgTable(
  "organizations",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    createdBy: uuid("created_by").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      "organization_name_length",
      sql`char_length(btrim(${t.name})) between 2 and 100`,
    ),
  ],
);
export const roles = pgTable("roles", {
  key: text().primaryKey(),
  name: text().notNull(),
});
export const permissions = pgTable("permissions", { key: text().primaryKey() });
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleKey: text("role_key")
      .notNull()
      .references(() => roles.key),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permissions.key),
  },
  (t) => [primaryKey({ columns: [t.roleKey, t.permissionKey] })],
);
export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    roleKey: text("role_key")
      .notNull()
      .references(() => roles.key),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.userId] }),
    index("organization_members_user_idx").on(t.userId),
  ],
);
export const events = pgTable(
  "events",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull().default(""),
    eventType: text("event_type").notNull().default("conference"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    timezone: text().notNull().default("Africa/Addis_Ababa"),
    location: text().notNull().default(""),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    registrationClosesAt: timestamp("registration_closes_at", {
      withTimezone: true,
    }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("events_organization_id_id_key").on(t.organizationId, t.id),
    index("events_organization_idx").on(t.organizationId, t.startsAt),
    check("event_time_order", sql`${t.endsAt} > ${t.startsAt}`),
  ],
);
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    actorId: uuid("actor_id"),
    action: text().notNull(),
    entityId: uuid("entity_id").notNull(),
    metadata: jsonb().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("audit_logs_organization_idx").on(t.organizationId, t.createdAt),
  ],
);
// SQL migrations own auth.users FKs, exact checks, grants, RLS and private functions.
// Never use drizzle push: it cannot replace security migrations.
