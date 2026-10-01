import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  configSchema,
  newDraft,
  publicEventSchema,
} from "../src/features/events/contracts";
import type { Database } from "../src/server/db/database.types";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref = process.env.SEED_PROJECT_REF;
if (
  process.env.APP_ENV !== "development" ||
  process.env.VERCEL_ENV ||
  !url ||
  !ref ||
  new URL(url).hostname !== ref + ".supabase.co" ||
  !process.argv.includes("--confirm=" + ref)
)
  throw new Error(
    "Seed refused: explicit development environment and matching project confirmation required.",
  );
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.SEED_EMAIL;
const password = process.env.SEED_PASSWORD;
if (!key || !email?.endsWith("@example.test") || !password)
  throw new Error(
    "Use an existing confirmed example.test development identity.",
  );
const db = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { error: authError } = await db.auth.signInWithPassword({
  email,
  password,
});
if (authError) throw new Error("Fixture sign-in failed");
const { data: org, error: orgError } = await db.rpc("create_organization", {
  org_name: "Amel Events Demo",
});
if (orgError) throw new Error("Organization setup failed");
const slug = "african-business-expo-2027-demo";
const { data: existing, error: lookupError } = await db
  .from("events")
  .select("id,revision,draft,published_at")
  .eq("organization_id", org)
  .eq("slug", slug)
  .maybeSingle();
if (lookupError) throw new Error("Seed lookup failed");
let eventId = existing?.id;
if (!existing) {
  const draft = newDraft();
  draft.basics = {
    name: "African Business Expo 2027 · Demo",
    slug,
    description:
      "A fictional development event showcasing African enterprise, creative exchange, and new connections. All registrations are synthetic.",
    eventType: "exhibition",
    startsAt: "2027-03-18T06:00:00Z",
    endsAt: "2027-03-20T15:00:00Z",
    closesAt: "2027-03-17T21:00:00Z",
    timezone: "Africa/Addis_Ababa",
    location: "Demo Exhibition Centre, Addis Ababa",
  };
  draft.config.types = ["Visitor", "Exhibitor", "VIP", "Speaker"].map(
    (name, i) => ({
      id: crypto.randomUUID(),
      name,
      description: "Demonstration category",
      capacity: 200,
      approval: i > 1,
    }),
  );
  draft.config.fields = [
    {
      id: crypto.randomUUID(),
      type: "text",
      label: "Company",
      help: "",
      required: false,
      options: [],
    },
  ];
  const { data: saved, error } = await db.rpc("create_event", {
    payload: draft,
  });
  if (error) throw new Error("Seed event creation failed");
  const result = z.object({ id: z.uuid(), revision: z.number() }).parse(saved);
  eventId = result.id;
  const { error: publishError } = await db.rpc("publish_event", {
    target: result.id,
    expected_revision: result.revision,
  });
  if (publishError) throw new Error("Seed publication failed");
} else if (!existing.published_at) {
  configSchema.parse(existing.draft);
  const { error } = await db.rpc("publish_event", {
    target: existing.id,
    expected_revision: existing.revision,
  });
  if (error) throw new Error("Seed publication failed");
}
const { data: publicData, error: publicError } = await db.rpc("public_event", {
  event_slug: slug,
});
if (publicError) throw new Error("Seed event unavailable");
const event = publicEventSchema.parse(publicData);
for (let i = 0; i < 50; i++) {
  const contact = "demo.guest" + (i + 1) + "@example.test";
  const { data: found, error: findError } = await db
    .from("registrations")
    .select("id")
    .eq("event_id", eventId!)
    .eq("email", contact)
    .maybeSingle();
  if (findError) throw new Error("Seed registration lookup failed");
  if (found) continue;
  const type =
    event.snapshot.config.types[i % event.snapshot.config.types.length];
  const fullName =
    [
      "Aster Demo",
      "Dawit Example",
      "Hana Sample",
      "Samuel Demo",
      "Liya Example",
      "Yonas Sample",
    ][i % 6] +
    " " +
    (i + 1);
  const { data: submitted, error } = await db.rpc("submit_registration", {
    event_slug: slug,
    version: event.versionId,
    registration_type: type.id,
    request: crypto.randomUUID(),
    name: fullName,
    email_address: contact,
    answers: Object.fromEntries(
      event.snapshot.config.fields.map((f) => [
        f.id,
        f.type === "checkbox"
          ? true
          : f.type === "select"
            ? f.options[0]
            : "Example Company " + ((i % 8) + 1),
      ]),
    ),
  });
  const result = z
    .object({ reference: z.uuid().optional(), error: z.string().optional() })
    .parse(submitted);
  if (error || !result.reference)
    throw new Error("Seed submission failed; existing records remain intact");
  if (type.approval && i % 4 === 3) {
    const { data: registration } = await db
      .from("registrations")
      .select("id")
      .eq("reference", result.reference)
      .single();
    if (registration) {
      const { error: reviewError } = await db.rpc("review_registration", {
        target: registration.id,
        decision: i % 8 === 3 ? "rejected" : "approved",
      });
      if (reviewError) throw new Error("Seed review failed");
    }
  }
}
await db.auth.signOut({ scope: "local" });
console.info(
  "Development seed complete: 50 synthetic registrations. Existing records were preserved.",
);
