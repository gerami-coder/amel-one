export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "UNEXPECTED";
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fields?: Record<string, string[]>;
};
export const initialActionState: ActionState = { status: "idle" };
export function publicError(error: unknown): ActionState {
  if (error instanceof AppError)
    return { status: "error", message: error.message };
  const reference = crypto.randomUUID();
  console.error(
    JSON.stringify({ level: "error", operation: "unexpected", reference }),
  );
  return {
    status: "error",
    message: `Something went wrong. Please try again. Reference: ${reference}`,
  };
}
