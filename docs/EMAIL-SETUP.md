# Authentication email setup

Status: pending Resend account sign-in and the owner's sending domain. No SMTP credential has been created or installed.

Use Resend SMTP with Supabase Auth, without a Resend SDK or email key in the Next.js runtime. Supabase remains responsible for generating confirmation/recovery links. Keep signup confirmation enabled.

1. Owner signs in to Resend or creates a free account and accepts its terms.
2. Owner identifies a domain and DNS provider. Use a dedicated authentication subdomain where practical.
3. Add the domain in Resend and add only the exact DNS records Resend supplies. Do not replace existing root-domain MX/SPF records.
4. Wait for verified sending status.
5. Create a domain-restricted sending credential and enter it directly in Supabase's custom SMTP settings. Never paste credentials in chat or commit them.
6. Use Resend's current SMTP host/port/username documentation and a sender at the verified domain. Verify free-plan limits in the account; do not enable paid overages without authorization.
7. Test signup confirmation and password recovery with an owner-approved inbox on the hosted app. Confirm email delivery, callback/session behavior and successful login.
8. Record results and enable Phase 1 only after the foundation gate passes.

Official instructions: https://resend.com/docs/send-with-supabase-smtp
Current plan details: https://resend.com/pricing
Supabase default-sender restrictions: https://supabase.com/docs/guides/auth/auth-smtp
