# Security

Verify users server-side with Supabase Auth. Refresh cookies in Next.js proxy and prevent caching personalized responses. Never authorize from user_metadata or getSession alone. Auth callback origins come from explicit configuration or Vercel's trusted deployment environment, not forwarded request headers. Redirect destinations are fixed internal paths.

Runtime uses publishable keys and session RLS. No service-role key enters web code. Private definer functions exist only for membership lookup and atomic organization creation, have fixed search_path, explicit grants, identity checks and bounded inputs. Public tables enable RLS and explicit privileges; audit writes are trigger-only.

Next.js Server Actions enforce same-origin mutation semantics; validate all inputs again on the server. Do not log personal form values or credentials. Authentication relies on Supabase abuse controls; enable CAPTCHA and custom SMTP before an open production launch. Public registration will require durable rate limits and atomic capacity checks in Phase 1.

Development, previews and production need separate projects. Never put production credentials in CI previews. Production launch requires a separate review of retention, backups, SMTP, abuse controls, storage MIME validation and host security headers. This repository's current status is development, not a production certification.
