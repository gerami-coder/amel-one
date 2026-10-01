"use client";
import Link from "next/link";
import { useActionState } from "react";
import {
  login,
  signup,
  forgotPassword,
  resetPassword,
  createOrganization,
} from "./actions";
import { initialActionState } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
const config = {
  login: {
    action: login,
    label: "Log in",
    pending: "Logging in…",
    fields: [
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "current-password",
      },
    ],
  },
  signup: {
    action: signup,
    label: "Create account",
    pending: "Creating account…",
    fields: [
      {
        name: "fullName",
        label: "Full name",
        type: "text",
        autoComplete: "name",
      },
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
      },
    ],
  },
  forgot: {
    action: forgotPassword,
    label: "Send reset link",
    pending: "Sending…",
    fields: [
      {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "email",
      },
    ],
  },
  reset: {
    action: resetPassword,
    label: "Update password",
    pending: "Updating…",
    fields: [
      {
        name: "password",
        label: "New password",
        type: "password",
        autoComplete: "new-password",
      },
    ],
  },
  organization: {
    action: createOrganization,
    label: "Create workspace",
    pending: "Creating workspace…",
    fields: [
      {
        name: "name",
        label: "Organization name",
        type: "text",
        autoComplete: "organization",
      },
    ],
  },
};
export function AuthForm({ mode }: { mode: keyof typeof config }) {
  const settings = config[mode];
  const [state, action, pending] = useActionState(
    settings.action,
    initialActionState,
  );
  return (
    <>
      <form action={action} noValidate>
        <FieldGroup>
          {settings.fields.map((field) => (
            <Field
              key={field.name}
              data-invalid={Boolean(state.fields?.[field.name])}
            >
              <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                required
                maxLength={field.name === "password" ? 128 : 254}
                aria-invalid={Boolean(state.fields?.[field.name])}
                aria-describedby={
                  state.fields?.[field.name]
                    ? `${field.name}-error`
                    : field.name === "password" && mode === "signup"
                      ? "password-help"
                      : undefined
                }
              />
              {field.name === "password" && mode === "signup" && (
                <p id="password-help" className="muted">
                  Use at least 12 characters.
                </p>
              )}
              {state.fields?.[field.name] && (
                <p id={`${field.name}-error`} className="field-error">
                  {state.fields[field.name]?.join(" ")}
                </p>
              )}
            </Field>
          ))}
        </FieldGroup>
        {state.message && (
          <Alert
            variant={state.status === "error" ? "destructive" : "default"}
            role={state.status === "error" ? "alert" : "status"}
          >
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? settings.pending : settings.label}
        </Button>
      </form>
      {mode === "login" && (
        <div className="auth-foot">
          <Link href="/forgot-password">Forgot password?</Link>
          <p>
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      )}
      {mode === "signup" && (
        <div className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      )}
      {mode === "reset" && (
        <div className="auth-foot">
          <Link href="/dashboard">Return to workspace</Link>
        </div>
      )}
    </>
  );
}
