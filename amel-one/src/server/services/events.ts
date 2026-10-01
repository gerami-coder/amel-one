import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { workspace } from "./organizations";
import { serverClient } from "@/server/auth/client";
import { draftSchema, publicEventSchema } from "@/features/events/contracts";
import type { Permission } from "@/server/permissions";
export async function eventWorkspace(
  id: string,
  permission: Permission = "event.read",
) {
  if (!z.uuid().safeParse(id).success) notFound();
  const context = await workspace(permission);
  const { data: event, error } = await context.db
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organization.id)
    .maybeSingle();
  if (error) throw new Error("Event could not be loaded");
  if (!event) notFound();
  const draft = draftSchema.parse({
    basics: {
      name: event.name,
      slug: event.slug,
      description: event.description,
      location: event.location,
      eventType: event.event_type,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      closesAt: event.registration_closes_at ?? event.starts_at,
      timezone: event.timezone,
    },
    config: event.draft,
  });
  return { ...context, event, draft };
}
export async function publicEvent(slug: string) {
  if (!/^[a-z0-9-]{2,100}$/.test(slug)) notFound();
  const db = await serverClient();
  const { data, error } = await db.rpc("public_event", { event_slug: slug });
  if (error) throw new Error("Event unavailable");
  if (!data) notFound();
  return publicEventSchema.parse(data);
}
