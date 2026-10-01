import { z } from "zod";
export const fieldSchema = z
  .object({
    id: z.uuid(),
    type: z.enum(["text", "email", "tel", "textarea", "select", "checkbox"]),
    label: z.string().trim().min(1).max(120),
    help: z.string().max(250),
    required: z.boolean(),
    options: z.array(z.string().trim().min(1).max(100)).max(20),
  })
  .refine((f) => f.type !== "select" || f.options.length > 0, {
    message: "Select fields need at least one option.",
  });
export const typeSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(2).max(80),
  description: z.string().max(500),
  capacity: z.number().int().min(1).max(100000),
  approval: z.boolean(),
});
export const configSchema = z
  .object({
    types: z.array(typeSchema).max(12),
    fields: z.array(fieldSchema).max(30),
    branding: z.object({
      logoPath: z
        .string()
        .regex(
          /^$|^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp)$/,
        )
        .default(""),
      theme: z.enum(["forest", "clay", "midnight"]),
      font: z.enum(["sans", "serif"]),
      heading: z.string().max(200),
      footer: z.string().max(500),
    }),
  })
  .superRefine((v, ctx) => {
    for (const key of ["types", "fields"] as const)
      if (new Set(v[key].map((x) => x.id)).size !== v[key].length)
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "IDs must be unique.",
        });
  });
export const basicsSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and single hyphens.",
      ),
    description: z.string().max(5000),
    location: z.string().max(200),
    eventType: z.enum(["conference", "exhibition", "workshop", "community"]),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    closesAt: z.iso.datetime({ offset: true }),
    timezone: z.string().refine((v) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid timezone."),
  })
  .superRefine((v, ctx) => {
    if (new Date(v.endsAt) <= new Date(v.startsAt))
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End must be after start.",
      });
    if (new Date(v.closesAt) > new Date(v.endsAt))
      ctx.addIssue({
        code: "custom",
        path: ["closesAt"],
        message: "Registration must close before the event ends.",
      });
  });
export const draftSchema = z.object({
  basics: basicsSchema,
  config: configSchema,
});
export type EventDraft = z.infer<typeof draftSchema>;
export type EventField = z.infer<typeof fieldSchema>;
export type EventConfig = z.infer<typeof configSchema>;
export const snapshotSchema = basicsSchema.safeExtend({ config: configSchema });
export const publicEventSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  snapshot: snapshotSchema,
  availability: z.record(z.string(), z.number()),
});
export type PublicEvent = z.infer<typeof publicEventSchema>;
export function publishIssues(d: EventDraft, now = new Date()): string[] {
  const errors: string[] = [];
  if (!draftSchema.safeParse(d).success)
    errors.push("Correct the highlighted event or form details.");
  if (d.basics.description.trim().length < 10)
    errors.push("Add an event description of at least 10 characters.");
  if (d.basics.location.trim().length < 2)
    errors.push("Add a venue or online location.");
  if (!d.config.types.length)
    errors.push("Add at least one registration type.");
  if (new Date(d.basics.startsAt) <= now || new Date(d.basics.closesAt) <= now)
    errors.push("Set a future event start and registration closing time.");
  return errors;
}
export const identitySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.email("Enter a valid email.").max(254),
});
export function validateAnswers(
  fields: EventField[],
  raw: Record<string, unknown>,
) {
  const answers: Record<string, string | boolean> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const value = raw[f.id];
    if (f.type === "checkbox") {
      answers[f.id] = value === true;
      if (f.required && value !== true) errors[f.id] = "This is required.";
      if (value !== undefined && typeof value !== "boolean")
        errors[f.id] = "Choose a valid answer.";
      continue;
    }
    const text = typeof value === "string" ? value : "";
    answers[f.id] = text;
    if (value !== undefined && typeof value !== "string")
      errors[f.id] = "Enter a valid answer.";
    else if (f.required && !text.trim()) errors[f.id] = "This is required.";
    else if (text.length > 2000)
      errors[f.id] = "Use no more than 2,000 characters.";
    else if (text && f.type === "select" && !f.options.includes(text))
      errors[f.id] = "Choose one of the listed options.";
    else if (text && f.type === "email" && !z.email().safeParse(text).success)
      errors[f.id] = "Enter a valid email.";
  }
  return { answers, errors };
}
export function newDraft(): EventDraft {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 30);
  start.setUTCHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 8 * 3600000);
  return {
    basics: {
      name: "",
      slug: "",
      description: "",
      location: "",
      eventType: "conference",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      closesAt: start.toISOString(),
      timezone: "Africa/Addis_Ababa",
    },
    config: {
      types: [],
      fields: [],
      branding: {
        logoPath: "",
        theme: "forest",
        font: "sans",
        heading: "",
        footer: "",
      },
    },
  };
}
