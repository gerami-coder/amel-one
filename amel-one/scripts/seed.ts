import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref = process.env.SEED_PROJECT_REF;
if (
  process.env.APP_ENV !== "development" ||
  process.env.VERCEL_ENV ||
  !url ||
  !ref ||
  new URL(url).hostname !== `${ref}.supabase.co` ||
  !process.argv.includes(`--confirm=${ref}`)
)
  throw new Error(
    "Seed refused. Explicit development environment and matching project confirmation are required.",
  );
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.SEED_EMAIL;
const password = process.env.SEED_PASSWORD;
if (!key || !email?.endsWith("@example.test") || !password)
  throw new Error(
    "Set an existing confirmed development fixture account with an example.test address.",
  );
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { error: authError } = await db.auth.signInWithPassword({
  email,
  password,
});
if (authError) throw new Error("Development fixture sign-in failed.");
const { data: org, error: orgError } = await db.rpc("create_organization", {
  org_name: "Amel Events Demo",
});
if (orgError) throw new Error("Organization creation failed.");
const { data: existing, error: lookupError } = await db
  .from("events")
  .select("id")
  .eq("organization_id", org)
  .eq("slug", "african-business-expo-2027-demo");
if (lookupError) throw new Error("Seed lookup failed.");
if (!existing.length) {
  const { error } = await db
    .from("events")
    .insert({
      organization_id: org,
      name: "African Business Expo 2027",
      slug: "african-business-expo-2027-demo",
      starts_at: "2027-03-18T06:00:00Z",
      ends_at: "2027-03-20T15:00:00Z",
      timezone: "Africa/Addis_Ababa",
      location: "Addis Ababa, Ethiopia",
    });
  if (error) throw new Error("Event seed failed.");
}
await db.auth.signOut();
console.info(
  "Development seed completed. Existing records were preserved. Attendee seeds are deferred until Phase 1 schema.",
);
