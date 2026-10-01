# Contributing

Read AGENTS.md and relevant docs before editing. Use small descriptive feature or fix branches (codex/ prefix for agent branches). Keep main deployable. Reuse components and services, write tests for important business rules and update documentation in the same change.

Before a pull request run lint, typecheck, unit/integration tests and production build. Include browser verification for user-visible changes and real RLS tests for schema changes. Do not commit .env files, service credentials, generated reports or test artifacts.

Describe the problem, resulting behavior, relevant checks and limits. Migrations require an explicit target environment, rollback implications, constraints, grants and RLS. Never make undocumented production edits.
