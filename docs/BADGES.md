# Badges and credentials — deferred

Phase 2 begins only after Phase 1 review. A badge template owns a constrained scene of text, shapes, images and dynamic bindings. Templates are versioned; assignment rules map registration attributes to templates with explicit priority and manual override.

registration_badges is a relation, not a permanent one-to-one column. It tracks primary status, issuance and revocation. Appearance is separate from access rights. QR credentials contain opaque random tokens, never attendee PII or predictable registration IDs. Store hashes of bearer tokens and enforce expiry/revocation server-side.

The public marketing simulator may use fake local state and must clearly label itself as a demo. It must not issue credentials or persist attendee data.
