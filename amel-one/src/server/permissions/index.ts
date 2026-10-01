export const permissions = [
  "organization.read",
  "event.read",
  "event.create",
  "event.update",
  "event.delete",
  "registration.read",
  "registration.create",
  "registration.update",
  "registration.approve",
  "registration.reject",
  "registration.export",
  "team.manage",
  "role.manage",
  "audit.read",
] as const;
export type Permission = (typeof permissions)[number];
export type Membership = {
  organizationId: string;
  permissions: readonly string[];
};
export function can(
  membership: Membership | null,
  organizationId: string,
  permission: Permission,
): boolean {
  return (
    membership?.organizationId === organizationId &&
    membership.permissions.includes(permission)
  );
}
