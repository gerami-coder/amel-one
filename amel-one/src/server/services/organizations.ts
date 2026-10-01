import "server-only";
import { requireUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { can, type Permission } from "@/server/permissions";
import { AppError } from "@/lib/errors";
export async function workspace(permission: Permission = "organization.read") {
  const { db, user } = await requireUser();
  const { data: members, error } = await db
    .from("organization_members")
    .select("organization_id,role_key,organizations(id,name)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1);
  if (error)
    throw new AppError("UNAVAILABLE", "We couldn't load your workspace.");
  const member = members[0];
  if (!member) redirect("/onboarding");
  const { data: grants, error: grantError } = await db
    .from("role_permissions")
    .select("permission_key")
    .eq("role_key", member.role_key);
  if (grantError)
    throw new AppError("UNAVAILABLE", "We couldn't check workspace access.");
  const membership = {
    organizationId: member.organization_id,
    permissions: grants.map((g) => g.permission_key),
  };
  if (!can(membership, member.organization_id, permission))
    throw new AppError("FORBIDDEN", "You don't have access to this workspace.");
  if (!member.organizations)
    throw new AppError("FORBIDDEN", "This workspace is unavailable.");
  return { db, user, organization: member.organizations, membership };
}
