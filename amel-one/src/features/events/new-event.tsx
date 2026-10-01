"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/form-control";
import { newDraft } from "./contracts";
import { saveEvent } from "./actions";
export function NewEvent() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{
    name: string;
    slug: string;
    eventType: "conference" | "exhibition" | "workshop" | "community";
  }>({ defaultValues: { eventType: "conference" } });
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <form
      className="panel form-stack"
      onSubmit={handleSubmit(async (values) => {
        setMessage("");
        try {
          const draft = newDraft();
          draft.basics = { ...draft.basics, ...values };
          const result = await saveEvent(null, 0, draft);
          if (result.ok) router.push("/dashboard/events/" + result.id);
          else setMessage(result.message);
        } catch {
          setMessage("We could not create this event. Please retry.");
        }
      })}
    >
      <div>
        <span className="eyebrow">01 / THE BEGINNING</span>
        <h2>Give your gathering a name.</h2>
        <p>You can shape the details, form and look next.</p>
      </div>
      <FormControl label="Event name" error={errors.name?.message}>
        <input
          {...register("name", {
            required: "Enter an event name.",
            minLength: { value: 2, message: "Use at least two characters." },
            maxLength: 150,
          })}
          placeholder="African Business Expo 2027"
        />
      </FormControl>
      <FormControl
        label="Event link"
        hint="A short, unique address. It stays fixed once you publish."
        error={errors.slug?.message}
      >
        <input
          {...register("slug", {
            required: "Choose an event link.",
            pattern: {
              value: /^[a-z0-9]+(-[a-z0-9]+)*$/,
              message: "Use lowercase letters, numbers and hyphens.",
            },
            maxLength: 100,
          })}
          placeholder="african-business-expo-2027"
        />
      </FormControl>
      <FormControl label="Event format">
        <select {...register("eventType")}>
          <option value="conference">Conference</option>
          <option value="exhibition">Exhibition</option>
          <option value="workshop">Workshop</option>
          <option value="community">Community gathering</option>
        </select>
      </FormControl>
      {message && (
        <p className="form-message error" role="alert">
          {message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}
