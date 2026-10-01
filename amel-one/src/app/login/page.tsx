import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthForm } from "@/features/auth/auth-form";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthLayout>
      <h1>Welcome back.</h1>
      <p>Let’s bring your next event together.</p>
      {error && (
        <p role="alert" className="field-error">
          That sign-in link is invalid or expired. Please log in or request a
          new link.
        </p>
      )}
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
