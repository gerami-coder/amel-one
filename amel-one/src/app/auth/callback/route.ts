import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/server/auth/client";
import { trustedOrigin } from "@/server/auth/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flow = request.nextUrl.searchParams.get("flow");
  if (code) {
    const db = await serverClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          flow === "recovery" ? "/reset-password" : "/dashboard",
          trustedOrigin(),
        ),
      );
  }
  return NextResponse.redirect(
    new URL("/login?error=callback", trustedOrigin()),
  );
}
