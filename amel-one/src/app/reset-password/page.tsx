import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthForm } from "@/features/auth/auth-form";
import { requireUser } from "@/server/auth/session";
export default async function Reset() {
  await requireUser();
  return (
    <AuthLayout>
      <h1>Choose a new password.</h1>
      <p>Use at least 12 characters to keep your account secure.</p>
      <AuthForm mode="reset" />
    </AuthLayout>
  );
}
