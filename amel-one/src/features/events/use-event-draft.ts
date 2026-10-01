"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveEvent, type SaveResult } from "./actions";
import { draftSchema, type EventDraft } from "./contracts";
export function useEventDraft(
  id: string,
  initial: EventDraft,
  revision: number,
) {
  const [draft, updateDraft] = useState(initial);
  const latest = useRef(initial);
  const setDraft = useCallback((input: EventDraft | ((previous: EventDraft) => EventDraft)) => {
    const value = typeof input === "function" ? input(latest.current) : input;
    latest.current = value;
    updateDraft(value);
  }, []);
  const saved = useRef(JSON.stringify(initial));
  const rev = useRef(revision);
  const flight = useRef<Promise<SaveResult> | null>(null);
  const [status, setStatus] = useState("All changes saved");
  const [busy, setBusy] = useState(false);
  const flush = useCallback(async (): Promise<SaveResult> => {
    while (flight.current) await flight.current;
    const value = latest.current;
    const serialized = JSON.stringify(value);
    if (serialized === saved.current)
      return { ok: true, id, revision: rev.current };
    const parsed = draftSchema.safeParse(value);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => i.path.join(" → ") + ": " + i.message)
        .join(" ");
      setStatus(message);
      return { ok: false, message };
    }
    setBusy(true);
    setStatus("Saving…");
    const request = saveEvent(id, rev.current, value).catch(() => ({
      ok: false as const,
      message: "Couldn’t save. Your draft is here. Retry when connected.",
    }));
    flight.current = request;
    const result = await request;
    flight.current = null;
    setBusy(false);
    if (result.ok) {
      rev.current = result.revision;
      saved.current = serialized;
      setStatus(
        JSON.stringify(latest.current) === serialized
          ? "All changes saved"
          : "Unsaved changes",
      );
    } else setStatus(result.message);
    return result;
  }, [id]);
  useEffect(() => {
    if (JSON.stringify(draft) === saved.current) return;
    const timer = setTimeout(() => void flush(), 1000);
    return () => clearTimeout(timer);
  }, [draft, flush]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== saved.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);
  return { draft, setDraft, status, busy, flush };
}
