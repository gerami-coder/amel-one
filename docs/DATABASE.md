# Database

Phase 0 entities: organizations, roles, permissions, role_permissions, organization_members, events and audit_logs. Auth identities remain in auth.users. Attendees will be separate Phase 1 entities.

Every tenant record carries organization_id. Event records use UUID IDs and UTC timestamps plus an IANA display timezone. Foreign keys, unique membership constraints, time checks and organization indexes protect invariants. Permissions and built-in roles are immutable reference data for ordinary sessions.

An atomic organization-creation function inserts the organization, owner membership and audit entry. Event writes create audit entries via a trigger in the same transaction. Clients cannot edit audit history. Deletes have no runtime path in Phase 0 and RLS denies them.

RLS is mandatory on every public table. Private permission lookup checks auth.uid(); public functions cannot execute privileged work anonymously. New migrations must preserve existing rows and assess rollback; initial migration rollback is destructive and only appropriate in an empty disposable environment.

Phase 1 adds registration types, immutable form versions, separate attendees, registrations, answers and status history with composite tenant/event foreign keys. Capacity allocation and registration submission must be atomic and idempotent. No future tables are created just to fill the roadmap.
