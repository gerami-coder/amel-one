"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { reviewRegistration } from "@/features/events/actions";
export function ReviewControls({
  id,
  approve,
  reject,
}: {
  id: string;
  approve: boolean;
  reject: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function review(decision: "approved" | "rejected") {
    setBusy(true);
    try {
      const result = await reviewRegistration(id, decision);
      if (result.ok) router.refresh();
      else setMessage(result.message ?? "Review failed.");
    } catch {
      setMessage("Review failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-stack">
      <div className="button-row">
        {approve && (
          <Button disabled={busy} onClick={() => void review("approved")}>
            Approve registration
          </Button>
        )}
        {reject && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void review("rejected")}
          >
            Reject registration
          </Button>
        )}
      </div>
      {message && (
        <p role="alert" className="form-message error">
          {message}
        </p>
      )}
    </div>
  );
}
