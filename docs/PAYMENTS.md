# Payments — deferred

Phase 3 introduces a PaymentProvider adapter with initialize, verify, webhook, refund and transaction lookup. Chapa is the first implementation; core code depends on normalized payment states, amounts in integer minor units and explicit ISO currency.

Successful browser redirects never prove payment. Verify signatures, ownership, expected amount and currency server-side. Provider event IDs and transaction references have unique constraints; idempotent processing and transactional outbox prevent repeated side effects. Secrets stay server-only. Audits exclude sensitive payment payloads.

Phase 1 accepts only free registrations. Paid settings must not imply an unavailable checkout works. Refunds require separate authorization and confirmed provider results.
