import "server-only";
import { AppError } from "@/lib/errors";
export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new AppError(
      "UNAVAILABLE",
      "Account access is being configured. Please try again shortly.",
    );
  return { url, key };
}
export function trustedOrigin() {
  const configured = process.env.APP_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new AppError(
    "UNAVAILABLE",
    "Account access is being configured. Please try again shortly.",
  );
}
