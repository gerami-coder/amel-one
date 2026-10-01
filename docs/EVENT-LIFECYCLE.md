# Event lifecycle

BUILD: unpublished configuration. REGISTER: published before registration closes. PREPARE: registration closed before start. LIVE: start <= now < end. REVIEW: now >= end. Stored times are UTC; rendering uses the event's IANA timezone.

The lifecycle resolver is pure and receives an optional clock for deterministic tests. BUILD takes precedence for unpublished drafts regardless of dates. Future transition commands must validate completeness and write an audit record atomically.

Contextual actions evolve with implemented capabilities: Publish in BUILD, Copy registration link in REGISTER, preparation summary in PREPARE, check-in in LIVE when Phase 2 exists, report in REVIEW when reporting exists. Never display a working-looking action for an unimplemented feature.
