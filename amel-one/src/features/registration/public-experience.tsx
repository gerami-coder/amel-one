"use client";
import Image from "next/image";
import { brandingLogoUrl } from "@/features/events/branding";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/form-control";
import { registerForEvent, type RegistrationResult } from "./actions";
import { validateAnswers, type PublicEvent } from "@/features/events/contracts";
type Values = {
  fullName: string;
  email: string;
  type: string;
  answers: Record<string, string | boolean>;
  website: string;
};
export function PublicExperience({
  event,
  requestId,
  preview = false,
}: {
  event: PublicEvent;
  requestId: string;
  preview?: boolean;
}) {
  const { snapshot: s } = event;
  const [result, setResult] = useState<RegistrationResult>({});
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      type:
        s.config.types.find((t) => (event.availability[t.id] ?? 0) > 0)?.id ??
        "",
      answers: {},
      website: "",
    },
  });
  const closed =
    new Date(s.closesAt) <= new Date() || new Date(s.endsAt) <= new Date();
  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: s.timezone,
  }).format(new Date(s.startsAt));
  return (
    <main
      id="main"
      className={
        "public-event theme-" +
        s.config.branding.theme +
        " font-" +
        s.config.branding.font
      }
    >
      <header className="public-header">
        <Brand />
        <span>{preview ? "EVENT PREVIEW" : "YOU’RE INVITED"}</span>
      </header>
      <div className="public-grid">
        <section className="public-story">
          {s.config.branding.logoPath && (
            <Image
              unoptimized
              className="event-logo"
              src={brandingLogoUrl(s.config.branding.logoPath)}
              width={180}
              height={90}
              alt={s.name + " logo"}
            />
          )}
          <span className="eyebrow">
            {s.eventType.toUpperCase()} · {s.timezone.replaceAll("_", " ")}
          </span>
          <h1>{s.config.branding.heading || s.name}</h1>
          {s.config.branding.heading && <h2>{s.name}</h2>}
          <p className="event-description">{s.description}</p>
          <div className="event-facts">
            <p>
              <CalendarDays size={20} />
              {date}
            </p>
            <p>
              <MapPin size={20} />
              {s.location}
            </p>
          </div>
          <div className="public-mark" aria-hidden="true">
            {s.name
              .split(" ")
              .slice(0, 2)
              .map((x) => x[0])
              .join("")}
            <span>A MOMENT TO CONNECT.</span>
          </div>
        </section>
        <section className="public-form panel">
          {result.reference ? (
            <div className="confirmation" role="status">
              <CheckCircle2 size={46} />
              <span className="eyebrow">A GOOD BEGINNING</span>
              <h2>
                {result.status === "pending"
                  ? "Your request is with the organizer."
                  : "You’re on the list."}
              </h2>
              <p>
                {result.status === "pending"
                  ? "Your registration is pending review."
                  : "Your place is confirmed."}{" "}
                Save this page or reference for your records.
              </p>
              <div className="receipt">
                <span>Registration reference</span>
                <strong>{result.reference}</strong>
              </div>
              <p>{s.name}</p>
              <small>This confirmation does not issue a badge or ticket.</small>
            </div>
          ) : (
            <>
              <div className="form-intro">
                <span className="eyebrow">MAKE IT A DATE</span>
                <h2>
                  {closed && !preview ? "Registration has closed." : "Join us."}
                </h2>
                <p>
                  {closed && !preview
                    ? "The organizer is no longer accepting registrations."
                    : "A few details, and you’re one step closer."}
                </p>
              </div>
              {(!closed || preview) && (
                <form
                  className="form-stack"
                  noValidate
                  onSubmit={handleSubmit(async (values) => {
                    if (preview) return;
                    setResult({});
                    const validation = validateAnswers(
                      s.config.fields,
                      values.answers,
                    );
                    if (Object.keys(validation.errors).length) {
                      for (const [id, message] of Object.entries(
                        validation.errors,
                      ))
                        setError(`answers.${id}`, { message });
                      return;
                    }
                    try {
                      const response = await registerForEvent({
                        slug: s.slug,
                        version: event.versionId,
                        type: values.type,
                        request: requestId,
                        fullName: values.fullName,
                        email: values.email,
                        answers: validation.answers,
                        website: values.website,
                      });
                      setResult(response);
                      if (response.fields)
                        for (const [key, message] of Object.entries(
                          response.fields,
                        )) {
                          if (key === "fullName" || key === "email")
                            setError(key, { message });
                          else setError(`answers.${key}`, { message });
                        }
                    } catch {
                      setResult({
                        error:
                          "The connection was interrupted. Your details are still here. Please retry.",
                      });
                    }
                  })}
                >
                  <FormControl
                    label="Registration type"
                    error={errors.type?.message}
                  >
                    <select
                      {...register("type", {
                        required: "Choose a registration type.",
                      })}
                    >
                      <option value="">Choose your place</option>
                      {s.config.types.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          disabled={
                            !preview && (event.availability[t.id] ?? 0) <= 0
                          }
                        >
                          {t.name} · Free
                          {(event.availability[t.id] ?? 0) <= 0 && !preview
                            ? " · Full"
                            : ""}
                          {t.approval ? " · Approval required" : ""}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormControl
                    label="Full name"
                    error={errors.fullName?.message}
                  >
                    <input
                      autoComplete="name"
                      {...register("fullName", {
                        required: "Enter your full name.",
                        minLength: {
                          value: 2,
                          message: "Use at least two characters.",
                        },
                        maxLength: 100,
                      })}
                    />
                  </FormControl>
                  <FormControl
                    label="Email address"
                    error={errors.email?.message}
                  >
                    <input
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        required: "Enter your email.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email.",
                        },
                        maxLength: 254,
                      })}
                    />
                  </FormControl>
                  {s.config.fields.map((f) => (
                    <FormControl
                      key={f.id}
                      label={f.label + (f.required ? " *" : "")}
                      hint={f.help}
                      error={errors.answers?.[f.id]?.message}
                    >
                      {f.type === "checkbox" ? (
                        <input
                          type="checkbox"
                          {...register(`answers.${f.id}`)}
                        />
                      ) : f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          maxLength={2000}
                          {...register(`answers.${f.id}`)}
                        />
                      ) : f.type === "select" ? (
                        <select {...register(`answers.${f.id}`)}>
                          <option value="">Choose an option</option>
                          {f.options.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          maxLength={2000}
                          {...register(`answers.${f.id}`)}
                        />
                      )}
                    </FormControl>
                  ))}
                  <div className="honeypot" aria-hidden="true">
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        {...register("website")}
                      />
                    </label>
                  </div>
                  {result.error && (
                    <p className="form-message error" role="alert">
                      {result.error}
                    </p>
                  )}
                  <p className="privacy-note">
                    Your details are shared with this event’s organizer to
                    manage your registration. Required questions are marked *.
                  </p>
                  <Button type="submit" disabled={isSubmitting || preview}>
                    {preview
                      ? "Preview only"
                      : isSubmitting
                        ? "Submitting…"
                        : "Complete registration"}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </Button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
      <footer className="public-footer">
        {s.config.branding.footer && <p>{s.config.branding.footer}</p>}
        <Brand />
      </footer>
    </main>
  );
}
