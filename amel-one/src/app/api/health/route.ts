import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return NextResponse.json({ status: "unconfigured" }, { status: 503 });
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.from("organizations").select("id").limit(1);
  const connected = !error || error.code === "42501";
  return NextResponse.json(
    { status: connected ? "ok" : "unavailable" },
    { status: connected ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
