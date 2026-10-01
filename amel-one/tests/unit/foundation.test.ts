import { describe, it, expect } from "vitest";
import { can } from "@/server/permissions";
import { eventStage } from "@/features/events/lifecycle";
import {
  loginSchema,
  signupSchema,
  organizationSchema,
} from "@/validators/auth";
describe("authorization", () => {
  it("requires exact tenant membership and permission", () => {
    const member = {
      organizationId: "A",
      permissions: ["event.read", "event.update"],
    };
    expect(can(member, "A", "event.read")).toBe(true);
    expect(can(member, "B", "event.read")).toBe(false);
    expect(can(member, "B", "event.update")).toBe(false);
    expect(can(member, "B", "event.delete")).toBe(false);
    expect(can(member, "A", "team.manage")).toBe(false);
    expect(can(null, "A", "event.read")).toBe(false);
  });
});
describe("lifecycle", () => {
  const event = {
    publishedAt: "2027-01-01Z",
    startsAt: "2027-03-18T06:00:00Z",
    endsAt: "2027-03-20T15:00:00Z",
    registrationClosesAt: "2027-03-17T21:00:00Z",
  };
  it("keeps unpublished past events in build", () =>
    expect(
      eventStage({ ...event, publishedAt: null }, new Date("2028-01-01")),
    ).toBe("BUILD"));
  it.each([
    ["2027-02-01", "REGISTER"],
    ["2027-03-17T21:00:00Z", "PREPARE"],
    ["2027-03-18T06:00:00Z", "LIVE"],
    ["2027-03-20T15:00:00Z", "REVIEW"],
  ])("handles %s boundary", (date, stage) =>
    expect(eventStage(event, new Date(date))).toBe(stage),
  );
});
describe("validation", () => {
  it("rejects invalid email and empty passwords", () =>
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
      false,
    ));
  it("requires strong signup password", () =>
    expect(
      signupSchema.safeParse({
        email: "demo@example.test",
        password: "short",
        fullName: "Demo Person",
      }).success,
    ).toBe(false));
  it("rejects blank or excessive workspace names", () => {
    expect(organizationSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(
      organizationSchema.safeParse({ name: "x".repeat(101) }).success,
    ).toBe(false);
  });
});
