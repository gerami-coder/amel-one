import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthForm } from "@/features/auth/auth-form";
export default function Signup() {
  return (
    <AuthLayout>
      <h1>Your next event starts here.</h1>
      <p>Create your account, then make a space for your team.</p>
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
