import "server-only";
import { z } from "zod";
import { notFound } from "next/navigation";
import { eventWorkspace } from "./events";
export async function registrations(
  id: string,
  query: { q?: string; status?: string; page?: string },
) {
  const context = await eventWorkspace(id, "registration.read");
  const page = Math.min(10000, Math.max(1, Number(query.page) || 1));
  const search = (query.q ?? "")
    .slice(0, 100)
    .replace(/[^a-zA-Z0-9 @.\-]/g, "")
    .trim();
  const status = ["pending", "approved", "rejected"].includes(
    query.status ?? "",
  )
    ? query.status
    : "";
  let statement = context.db
    .from("registrations")
    .select("id,full_name,email,status,created_at,registration_types(name)", {
      count: "exact",
    })
    .eq("organization_id", context.organization.id)
    .eq("event_id", id)
    .order("created_at", { ascending: false });
  if (search)
    statement = statement.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`,
    );
  if (status) statement = statement.eq("status", status);
  const { data, count, error } = await statement.range(
    (page - 1) * 25,
    page * 25 - 1,
  );
  if (error) throw new Error("Registrations could not be loaded");
  return { ...context, rows: data, total: count ?? 0, page, search, status };
}
export async function registrationDetail(eventId: string, id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const context = await eventWorkspace(eventId, "registration.read");
  const { data: registration, error } = await context.db
    .from("registrations")
    .select("*,event_versions(snapshot,version)")
    .eq("id", id)
    .eq("event_id", eventId)
    .eq("organization_id", context.organization.id)
    .maybeSingle();
  if (error) throw new Error("Registration unavailable");
  if (!registration) notFound();
  const [{ data: answers, error: a }, { data: history, error: h }] =
    await Promise.all([
      context.db
        .from("registration_answers")
        .select("answers")
        .eq("registration_id", id)
        .eq("organization_id", context.organization.id)
        .single(),
      context.db
        .from("registration_status_history")
        .select("from_status,to_status,created_at")
        .eq("registration_id", id)
        .eq("organization_id", context.organization.id)
        .order("created_at"),
    ]);
  if (a || h) throw new Error("Registration history unavailable");
  return { ...context, registration, answers: answers.answers, history };
}
