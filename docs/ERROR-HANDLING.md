# Error handling

Use structured error codes: VALIDATION, UNAUTHENTICATED, FORBIDDEN, CONFLICT, UNAVAILABLE and UNEXPECTED. Actions return serializable status, message and optional field errors. Validation errors render beside labelled controls. Unexpected errors produce a random reference and safe structured log metadata, never raw stack traces or submitted secrets.

Unauthenticated dashboard requests redirect to login; unauthorized records return a neutral unavailable state without confirming cross-tenant existence. Route boundaries expose retry and recovery. Loading skeletons preserve layout. Successful actions only announce completion after server confirmation.

Editors preserve unsaved input on network failure and offer Retry. Never label a local draft as saved to the server. Avoid broad catch blocks around Next.js redirect control flow.
