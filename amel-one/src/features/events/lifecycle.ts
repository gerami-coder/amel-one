export const stages = [
  "BUILD",
  "REGISTER",
  "PREPARE",
  "LIVE",
  "REVIEW",
] as const;
export type EventStage = (typeof stages)[number];
export function eventStage(
  event: {
    publishedAt: string | null;
    startsAt: string;
    endsAt: string;
    registrationClosesAt: string | null;
  },
  now = new Date(),
): EventStage {
  if (!event.publishedAt) return "BUILD";
  if (now >= new Date(event.endsAt)) return "REVIEW";
  if (now >= new Date(event.startsAt)) return "LIVE";
  if (event.registrationClosesAt && now >= new Date(event.registrationClosesAt))
    return "PREPARE";
  return "REGISTER";
}
