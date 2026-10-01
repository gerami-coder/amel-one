# Amel One application

See [the repository README](../README.md) and [architecture](../docs/ARCHITECTURE.md).

From this directory: npm ci, copy .env.example to .env.local and set the Supabase public values, npm run dev.

Verification: npm run lint, npm run typecheck, npm test, npm run build, npm run test:e2e.

No privileged database key is required by the application runtime.
