"use server";
import { z } from "zod";
import { serverClient } from "@/server/auth/client";
import {
  publicEventSchema,
  identitySchema,
  validateAnswers,
} from "@/features/events/contracts";
export type RegistrationResult = {
  reference?: string;
  status?: string;
  error?: string;
  fields?: Record<string, string>;
};
const inputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,100}$/),
  version: z.uuid(),
  type: z.uuid(),
  request: z.uuid(),
  fullName: z.string().max(100),
  email: z.string().max(254),
  answers: z.record(z.string(), z.unknown()),
  website: z.string().max(100).optional(),
});
export async function registerForEvent(
  raw: unknown,
): Promise<RegistrationResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success)
    return { error: "Check your details and choose a registration type." };
  const input = parsed.data;
  if (input.website) return { error: "Registration could not be submitted." };
  const identity = identitySchema.safeParse(input);
  if (!identity.success)
    return {
      error: "Check the highlighted fields.",
      fields: Object.fromEntries(
        identity.error.issues.map((i) => [i.path[0], i.message]),
      ),
    };
  const db = await serverClient();
  const { data, error } = await db.rpc("public_event", {
    event_slug: input.slug,
  });
  if (error || !data) return { error: "This event is currently unavailable." };
  const event = publicEventSchema.parse(data);
  const checked = validateAnswers(event.snapshot.config.fields, input.answers);
  if (Object.keys(checked.errors).length)
    return { error: "Check the highlighted fields.", fields: checked.errors };
  const { data: result, error: submissionError } = await db.rpc(
    "submit_registration",
    {
      event_slug: input.slug,
      version: input.version,
      registration_type: input.type,
      request: input.request,
      name: identity.data.fullName,
      email_address: identity.data.email,
      answers: checked.answers,
    },
  );
  if (submissionError)
    return {
      error:
        "We could not submit your registration. Your details are still here; please retry.",
    };
  return z
    .object({
      reference: z.uuid().optional(),
      status: z.string().optional(),
      error: z.string().optional(),
    })
    .parse(result);
}
