"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { serverClient } from "@/server/auth/client";
import { trustedOrigin } from "@/server/auth/config";
import {
  loginSchema,
  signupSchema,
  organizationSchema,
} from "@/validators/auth";
import { publicError, type ActionState } from "@/lib/errors";
import { requireUser } from "@/server/auth/session";
export async function login(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      status: "error",
      fields: z.flattenError(parsed.error).fieldErrors,
      message: "Check the highlighted fields.",
    };
  try {
    const db = await serverClient();
    const { error } = await db.auth.signInWithPassword(parsed.data);
    if (error)
      return {
        status: "error",
        message:
          "We couldn't sign you in. Check your email and password, and confirm your email if you just signed up.",
      };
  } catch (error) {
    return publicError(error);
  }
  redirect("/dashboard");
}
export async function signup(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      status: "error",
      fields: z.flattenError(parsed.error).fieldErrors,
      message: "Check the highlighted fields.",
    };
  try {
    const db = await serverClient();
    const { data, error } = await db.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        emailRedirectTo: `${trustedOrigin()}/auth/callback`,
      },
    });
    if (error)
      return {
        status: "error",
        message:
          "We couldn't create your account. Try again shortly, or log in if you already have an account.",
      };
    if (!data.session)
      return {
        status: "success",
        message:
          "Check your email for a confirmation link. Once confirmed, you can set up your workspace.",
      };
  } catch (error) {
    return publicError(error);
  }
  redirect("/onboarding");
}
export async function createOrganization(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requireUser();
  const parsed = organizationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      status: "error",
      fields: z.flattenError(parsed.error).fieldErrors,
      message: "Enter your organization name.",
    };
  const { error } = await db.rpc("create_organization", {
    org_name: parsed.data.name,
  });
  if (error)
    return {
      status: "error",
      message:
        "We couldn't create your workspace. Your details are still here—please try again.",
    };
  redirect("/dashboard");
}
export async function logout() {
  const db = await serverClient();
  const { error } = await db.auth.signOut({ scope: "local" });
  if (error) throw new Error("Sign out failed");
  redirect("/login");
}
export async function forgotPassword(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ email: z.email().max(254) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      status: "error",
      fields: { email: ["Enter a valid email address."] },
      message: "Check your email address.",
    };
  try {
    const db = await serverClient();
    await db.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${trustedOrigin()}/auth/callback?flow=recovery`,
    });
  } catch (error) {
    return publicError(error);
  }
  return {
    status: "success",
    message:
      "If this email belongs to an account, you'll receive a password reset link shortly.",
  };
}
export async function resetPassword(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { db } = await requireUser();
  const parsed = z
    .object({
      password: z.string().min(12, "Use at least 12 characters.").max(128),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      status: "error",
      fields: { password: ["Use 12–128 characters."] },
      message: "Check your new password.",
    };
  const { error } = await db.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return {
      status: "error",
      message:
        "Couldn't update your password. Request a new reset link and try again.",
    };
  return {
    status: "success",
    message:
      "Your password has been updated. You can return to your workspace.",
  };
}
