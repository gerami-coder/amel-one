import { describe, it, expect } from "vitest";
import {
  configSchema,
  validateAnswers,
  publishIssues,
  newDraft,
} from "@/features/events/contracts";
const field = {
  id: "a3067a21-6c5a-465f-a88f-cfb280379b29",
  type: "select" as const,
  label: "Country",
  help: "",
  required: true,
  options: ["Ethiopia", "Kenya"],
};
describe("published form contracts", () => {
  it("rejects missing required answers and choices outside the published options", () => {
    expect(validateAnswers([field], {}).errors[field.id]).toBeTruthy();
    expect(
      validateAnswers([field], { [field.id]: "Other" }).errors[field.id],
    ).toBeTruthy();
    expect(validateAnswers([field], { [field.id]: "Kenya" }).errors).toEqual(
      {},
    );
  });
  it("strips answers for unknown field IDs", () =>
    expect(
      validateAnswers([field], { [field.id]: "Kenya", unknown: "not retained" })
        .answers,
    ).toEqual({ [field.id]: "Kenya" }));
  it("requires true for required checkbox consent", () => {
    const checkbox = { ...field, type: "checkbox" as const };
    expect(
      validateAnswers([checkbox], { [field.id]: false }).errors[field.id],
    ).toBeTruthy();
    expect(validateAnswers([checkbox], { [field.id]: true }).errors).toEqual(
      {},
    );
  });
  it("validates optional email only when provided", () => {
    const email = { ...field, type: "email" as const, required: false };
    expect(validateAnswers([email], {}).errors).toEqual({});
    expect(
      validateAnswers([email], { [field.id]: "wrong" }).errors[field.id],
    ).toBeTruthy();
  });
  it("rejects oversized and mistyped answers", () => {
    const text = { ...field, type: "text" as const };
    expect(
      validateAnswers([text], { [field.id]: "x".repeat(2001) }).errors[
        field.id
      ],
    ).toBeTruthy();
    expect(
      validateAnswers([text], { [field.id]: true }).errors[field.id],
    ).toBeTruthy();
  });
  it("rejects duplicate field IDs", () => {
    const config = newDraft().config;
    config.fields = [field, field];
    expect(configSchema.safeParse(config).success).toBe(false);
  });
  it("explains incomplete publish configuration", () => {
    expect(publishIssues(newDraft())).toContain(
      "Add at least one registration type.",
    );
  });
});
