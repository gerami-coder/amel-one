import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthForm } from "@/features/auth/auth-form";
import { requireUser } from "@/server/auth/session";
export default async function Onboarding() {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);
  if (error) throw error;
  if (data.length) redirect("/dashboard");
  return (
    <AuthLayout>
      <h1>Make yourself at home.</h1>
      <p>
        Name your organization. This is where your events will come together.
      </p>
      <AuthForm mode="organization" />
    </AuthLayout>
  );
}
