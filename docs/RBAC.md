# Permissions

Authorization is permission-based, scoped to a validated organization membership. Built-in owner, administrator, event_manager and viewer roles map to permissions in the database. Roles are not compared inside UI components.

Foundation permissions include organization.read; event.read/create/update/delete; registration.read/create/update/approve/reject/export; team.manage; role.manage; audit.read. Future permissions are introduced with their feature migrations.

The server verifies the identity, resolves membership, evaluates the required permission and then performs a session-scoped query. RLS repeats the same permission gate using private.has_permission. Changing a browser organization ID cannot grant access. Read/update/delete tests intentionally target another organization.

No client can grant itself membership or edit role permissions. Owner membership is bootstrapped transactionally. Team invitations and custom roles are future work; don't expose nonfunctional controls.
