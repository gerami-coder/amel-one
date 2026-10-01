# Database
Foundation: organizations, roles, permissions, role_permissions, organization_members, events and audit_logs. SaaS identities remain in auth.users; attendees are independent people and need no account.

Phase 1 adds event_versions, registration_types, attendees, registrations, registration_answers and registration_status_history. Private registration_limits stores hashed event/email rate-limit buckets. Events carry a JSON draft, revision and active published version. Composite organization/event foreign keys prevent cross-tenant associations. Unique event/email registration, global request UUID and tenant/email attendee constraints prevent duplicate records.

Runtime roles have tenant/permission-scoped SELECT policies. All event, version, registration, answer and history writes go through validated commands; direct INSERT/UPDATE/DELETE grants are revoked. Immutable versions preserve historical meaning. Audit inserts occur in the same transaction as mutations. Pending and approved registrations consume capacity; rejecting pending releases capacity. A row lock on the event serializes allocation and publishing. Repeating an identical request returns its receipt; changing the payload with the same request ID fails.

Migrations (in application supabase/migrations):
- 20261001072201_foundation.sql: tenant, roles, events and audit foundation.
- 20261001082941_registration_workflow.sql: registration schema, policies and commands.
- 20261001084701_registration_validation_hardening.sql: mandatory JSON arrays and create wrapper.
- 20261001085051_registration_submission_fix.sql: explicit version parameter reference.
- 20261001085739_event_branding_storage.sql: public immutable logo bucket with tenant-scoped upload.
- 20261001091109_concurrency_and_asset_validation.sql: HTTP conflict SQLSTATE, logo paths and old rate bucket cleanup.

These migrations were applied to the selected development project only. Apply in timestamp order. Historical fixes are preserved as forward migrations. Rollback must preserve published snapshots and registrations; do not drop tables on a populated project. Generated database.types.ts matches exposed APIs; Drizzle descriptors document entities but do not replace migration-owned policies/constraints.

Logo objects use organization/event/random UUID paths, max 2 MB, PNG/JPEG/WebP only. The bucket is public for brand assets and explicitly labeled in the uploader. No runtime overwrite/delete grants: published versions retain their logos.
- 20261001092645_storage_policy_and_version_index.sql: qualify storage object paths and index the active-version foreign key.
