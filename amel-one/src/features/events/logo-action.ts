"use server";
import { z } from "zod";
import { eventWorkspace } from "@/server/services/events";
export async function uploadEventLogo(
  form: FormData,
): Promise<{ path?: string; error?: string }> {
  const id = z.uuid().safeParse(form.get("eventId"));
  if (!id.success) return { error: "Invalid event." };
  const { db, organization } = await eventWorkspace(id.data, "event.update");
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 12 || file.size > 2 * 1024 * 1024)
    return { error: "Choose an image up to 2 MB." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP";
  const type = png
    ? "image/png"
    : jpeg
      ? "image/jpeg"
      : webp
        ? "image/webp"
        : null;
  if (!type || file.type !== type)
    return { error: "Choose a valid PNG, JPEG or WebP image." };
  const extension = png ? "png" : jpeg ? "jpg" : "webp";
  const path =
    organization.id +
    "/" +
    id.data +
    "/" +
    crypto.randomUUID() +
    "." +
    extension;
  const { error } = await db.storage
    .from("amel-event-branding")
    .upload(path, bytes, {
      contentType: type,
      upsert: false,
      cacheControl: "31536000",
    });
  return error
    ? { error: "The logo could not be uploaded. Please retry." }
    : { path };
}
