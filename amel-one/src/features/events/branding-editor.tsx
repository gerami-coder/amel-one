"use client";
import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/form-control";
import { uploadEventLogo } from "./logo-action";
import type { EventConfig } from "./contracts";
import { brandingLogoUrl } from "./branding";
export function BrandingEditor({
  id,
  value,
  onChange,
}: {
  id: string;
  value: EventConfig["branding"];
  onChange: (value: Partial<EventConfig["branding"]>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <section className="panel form-stack">
      <div>
        <h2>Make the welcome feel like you.</h2>
        <p>Accessible themes keep your event clear on every screen.</p>
      </div>
      <FormControl
        label="Event logo"
        hint="PNG, JPEG or WebP, up to 2 MB. Uploaded logos are public brand assets."
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setMessage("");
            try {
              const form = new FormData();
              form.set("eventId", id);
              form.set("file", file);
              const result = await uploadEventLogo(form);
              if (result.path) onChange({ logoPath: result.path });
              else setMessage(result.error ?? "Upload failed.");
            } catch {
              setMessage("Upload failed. Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </FormControl>
      {busy && <p role="status">Uploading logo…</p>}
      {message && (
        <p className="form-message error" role="alert">
          {message}
        </p>
      )}
      {value.logoPath && (
        <div className="button-row">
          <Image
            className="event-logo"
            unoptimized
            src={brandingLogoUrl(value.logoPath)}
            width={180}
            height={90}
            alt="Event logo"
          />
          <Button
            variant="outline"
            onClick={() => onChange({ ...value, logoPath: "" })}
          >
            Remove from draft
          </Button>
        </div>
      )}
      <div className="theme-picker">
        {(["forest", "clay", "midnight"] as const).map((theme) => (
          <button
            className={"theme-swatch theme-" + theme}
            key={theme}
            aria-pressed={value.theme === theme}
            onClick={() => onChange({ ...value, theme })}
          >
            {theme}
            {value.theme === theme && <Check size={20} />}
          </button>
        ))}
      </div>
      <FormControl label="Heading style">
        <select
          value={value.font}
          onChange={(e) =>
            onChange({
              ...value,
              font: e.target.value === "serif" ? "serif" : "sans",
            })
          }
        >
          <option value="sans">Modern sans</option>
          <option value="serif">Editorial serif</option>
        </select>
      </FormControl>
      <FormControl
        label="Welcome heading"
        hint="Leave blank to use your event name."
      >
        <input
          value={value.heading}
          maxLength={200}
          onChange={(e) => onChange({ ...value, heading: e.target.value })}
        />
      </FormControl>
      <FormControl label="Footer message">
        <textarea
          value={value.footer}
          maxLength={500}
          onChange={(e) => onChange({ ...value, footer: e.target.value })}
        />
      </FormControl>
    </section>
  );
}
