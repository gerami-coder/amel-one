# Authentication email setup
On 1 October 2026 the owner configured an existing SMTP provider directly in Supabase. Saved settings were verified in a fresh dashboard tab. The owner subsequently confirmed the signup email arrived; the account has email_confirmed_at populated. Resend onboarding is no longer required.

Sender name: Amel One. Transport: implicit TLS port 465, minimum interval 60 seconds per user. A workstation probe negotiated TLS 1.3, validated the hostname certificate and received the SMTP greeting. SMTP credentials remain in Supabase and are not copied into the app or repository.

The confirmed account and successful delivery resolve the signup email check. Password recovery delivery and reset completion remain unverified; the owner must enter any new password themselves. Keep email confirmation enabled. Do not change DNS, rotate credentials or install a replacement provider without a concrete need.

This SMTP integration sends Supabase authentication messages. Phase 1 attendee registration provides an on-screen receipt only; attendee emails require a later communications adapter and are not claimed as delivered.

Documentation: https://supabase.com/docs/guides/auth/auth-smtp
