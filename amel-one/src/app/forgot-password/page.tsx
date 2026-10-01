import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthForm } from "@/features/auth/auth-form";
export default function Forgot() {
  return (
    <AuthLayout>
      <h1>A fresh start.</h1>
      <p>We’ll send a link to reset your password.</p>
      <AuthForm mode="forgot" />
    </AuthLayout>
  );
}
