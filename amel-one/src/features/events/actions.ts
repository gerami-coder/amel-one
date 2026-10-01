"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { workspace } from "@/server/services/organizations";
import { draftSchema } from "./contracts";
import { serverClient } from "@/server/auth/client";
export type SaveResult =
  | { ok: true; id: string; revision: number }
  | { ok: false; message: string };
function safeMessage(error: { code?: string; message: string }) {
  if (error.code === "PT409")
    return "Another tab changed this event. Reload before saving; copy any unsaved text first.";
  if (error.code === "23505")
    return "That event link is already in use. Choose a different link.";
  if (error.code === "42501")
    return "You do not have permission for this change.";
  if (error.code === "22023") return error.message;
  return "The change could not be saved. Your draft is still here. Please retry.";
}
export async function saveEvent(
  id: string | null,
  revision: number,
  payload: unknown,
): Promise<SaveResult> {
  const { db } = await workspace(id ? "event.update" : "event.create");
  const parsed = draftSchema.safeParse(payload);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues
        .map((i) => i.path.join(".") + ": " + i.message)
        .join(" ")
        .slice(0, 700),
    };
  if (!z.number().int().nonnegative().safeParse(revision).success || (id && !z.uuid().safeParse(id).success))
    return { ok: false, message: "Invalid event." };
  const { data, error } = id
    ? await db.rpc("save_event", {
        target: id,
        expected_revision: revision,
        payload: parsed.data,
      })
    : await db.rpc("create_event", { payload: parsed.data });
  if (error) return { ok: false, message: safeMessage(error) };
  const saved = z.object({ id: z.uuid(), revision: z.number() }).parse(data);
  revalidatePath("/dashboard");
  return { ok: true, ...saved };
}
export async function publishEvent(id: string, revision: number) {
  await workspace("event.update");
  if (!z.uuid().safeParse(id).success || !z.number().int().positive().safeParse(revision).success)
    return { ok: false as const, message: "Invalid event." };
  const db = await serverClient();
  const { error } = await db.rpc("publish_event", {
    target: id,
    expected_revision: revision,
  });
  if (error) return { ok: false as const, message: safeMessage(error) };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events/" + id);
  return { ok: true as const };
}
export async function reviewRegistration(
  id: string,
  decision: "approved" | "rejected",
) {
  const { db } = await workspace(
    decision === "approved" ? "registration.approve" : "registration.reject",
  );
  if (
    !z.uuid().safeParse(id).success ||
    !["approved", "rejected"].includes(decision)
  )
    return { ok: false, message: "Invalid review." };
  const { error } = await db.rpc("review_registration", {
    target: id,
    decision,
  });
  if (error) return { ok: false, message: safeMessage(error) };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
