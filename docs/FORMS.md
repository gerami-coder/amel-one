# Form architecture

Phase 1 uses a bounded JSON schema with stable UUID field IDs, labels, type, requiredness, help text, options and validation limits. Start with text, email, telephone, textarea, select and checkbox. Reject unknown field types and excessive counts or lengths server-side.

Drafts can change. Publishing creates an immutable version; registrations point at that exact version and answers use field IDs, preserving historical meaning. Never rewrite an old version to rename or delete a field.

One evaluator is shared between preview and server validation. Hidden fields do not become required and their submitted values are discarded. Conditional rules must reference known earlier fields and reject cycles. Keep advanced rules deferred if they jeopardize the primary workflow.

The builder needs button-based reordering, keyboard access, undo/redo, debounced saves, revision conflict checks and honest saving/error states. Mobile uses a single canvas with contextual editing rather than shrinking three panels.
