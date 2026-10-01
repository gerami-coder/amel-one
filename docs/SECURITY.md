# Security
Server guards verify Supabase users and permissions; proxy refreshes cookies. Personalized routes are dynamic. Auth callback origins use APP_URL or Vercel's trusted deployment environment, never browser headers. Redirect paths are fixed.

Runtime uses publishable keys and session RLS. No service-role key enters web code. Tenant tables enable RLS and explicit grants. Narrow private definer commands have fixed search_path and bounded inputs; anonymous public_event/submit_registration are intentional exceptions exposing only published metadata and opaque receipts. Never expose attendee queries to anonymous callers.

Server Actions enforce same-origin semantics. SQL independently validates direct RPC requests. Public submission uses durable per-event (60/minute) and per-email (5/hour) limits, replay fingerprints, an application honeypot and transactional capacity checks. These are baseline abuse controls, not a replacement for production bot mitigation or edge/IP limits. Browser-generated request IDs are not authentication credentials.

Logo uploads verify size, MIME and magic bytes. Storage policies enforce organization/event paths and event.update permission. Public logos contain no attendee uploads; old assets remain for immutable snapshots. Security headers deny framing and disable unused camera, microphone and geolocation access.

No personal answers or credentials belong in logs. Test identities use example.test and ignored local fixtures. Custom SMTP signup delivery was confirmed by the owner; password recovery remains unverified. The security advisor reports leaked-password protection disabled: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Do not silently purchase an upgrade.

Development previews use the dedicated dev database. Production requires a separate project and review of retention/deletion, backups/recovery, abuse controls, password recovery, monitoring and email deliverability. This is a development release, not a production certification.
