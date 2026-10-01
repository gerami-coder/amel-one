"use client";
import { BrandingEditor } from "./branding-editor";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/shared/form-control";
import { FormBuilder } from "./form-builder";
import { useEventDraft } from "./use-event-draft";
import { publishEvent } from "./actions";
import { publishIssues, type EventDraft } from "./contracts";
const tabs = ["Basics", "Registration types", "Form", "Branding", "Publish"];
export function EventEditor({
  id,
  initial,
  revision,
  published,
}: {
  id: string;
  initial: EventDraft;
  revision: number;
  published: boolean;
}) {
  const { draft, setDraft, status, busy, flush } = useEventDraft(
    id,
    initial,
    revision,
  );
  const [tab, setTab] = useState("Basics");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();
  const { basics, config } = draft;
  const setBasics = (value: Partial<EventDraft["basics"]>) =>
    setDraft({ ...draft, basics: { ...basics, ...value } });
  const setConfig = (value: Partial<EventDraft["config"]>) =>
    setDraft({ ...draft, config: { ...config, ...value } });
  const problems = publishIssues(draft);
  return (
    <div className="editor">
      <div className="editor-toolbar">
        <div role="status" className="save-status">
          {busy ? "Saving…" : status}
        </div>
        <div className="button-row">
          <Button
            variant="outline"
            onClick={() => void flush()}
            disabled={busy || publishing}
          >
            Save now
          </Button>
          <Button
            variant="outline"
            disabled={busy || publishing}
            onClick={async () => {
              const saved = await flush();
              if (saved.ok) router.push("/dashboard/events/" + id + "/preview");
            }}
          >
            Preview <ExternalLink size={14} />
          </Button>
        </div>
      </div>
      <div className="editor-tabs" role="tablist" aria-label="Event setup">
        {tabs.map(
          (name, i) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === name}
              id={"setup-tab-" + i}
              aria-controls="setup-panel"
              tabIndex={tab === name ? 0 : -1}
              onKeyDown={(e) => {
                const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i + tabs.length - 1) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
                if (next === null) return;
                e.preventDefault();
                setTab(tabs[next]); setMessage("");
                document.getElementById("setup-tab-" + next)?.focus();
              }}
              key={name}
              onClick={() => {
                setTab(name);
                setMessage("");
              }}
            >
              <small>0{i + 1}</small>
              {name}
            </button>
          ),
        )}
      </div>
      <div role="tabpanel" id="setup-panel" aria-labelledby={"setup-tab-" + tabs.indexOf(tab)} tabIndex={0}>
        {tab === "Basics" && (
          <section className="panel form-stack">
            <div>
              <h2>The essentials, thoughtfully set.</h2>
              <p>Changes stay in your draft until you publish.</p>
            </div>
            <div className="form-grid">
              <FormControl label="Event name">
                <input
                  value={basics.name}
                  onChange={(e) => setBasics({ name: e.target.value })}
                  maxLength={150}
                />
              </FormControl>
              <FormControl
                label="Event link"
                hint={
                  published
                    ? "Published links are permanent."
                    : "/e/" + basics.slug
                }
              >
                <input
                  value={basics.slug}
                  disabled={published}
                  onChange={(e) => setBasics({ slug: e.target.value })}
                />
              </FormControl>
            </div>
            <FormControl label="Description">
              <textarea
                rows={5}
                value={basics.description}
                maxLength={5000}
                onChange={(e) => setBasics({ description: e.target.value })}
              />
            </FormControl>
            <div className="form-grid">
              <FormControl label="Location">
                <input
                  value={basics.location}
                  onChange={(e) => setBasics({ location: e.target.value })}
                  maxLength={200}
                />
              </FormControl>
              <FormControl label="Display timezone">
                <select
                  value={basics.timezone}
                  onChange={(e) => setBasics({ timezone: e.target.value })}
                >
                  {Array.from(
                    new Set([
                      basics.timezone,
                      "Africa/Addis_Ababa",
                      "Africa/Nairobi",
                      "UTC",
                      "Europe/London",
                      "America/New_York",
                      "Asia/Dubai",
                    ]),
                  ).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormControl>
            </div>
            <p className="muted">
              Enter schedule times in UTC. Guests see them in your chosen
              display timezone.
            </p>
            <div className="form-grid">
              {(["startsAt", "endsAt", "closesAt"] as const).map((key, i) => (
                <FormControl
                  key={key}
                  label={
                    ["Start (UTC)", "End (UTC)", "Registration closes (UTC)"][i]
                  }
                >
                  <input
                    type="datetime-local"
                    value={basics[key].slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value)
                        setBasics({
                          [key]: new Date(e.target.value + "Z").toISOString(),
                        });
                    }}
                  />
                </FormControl>
              ))}
            </div>
          </section>
        )}
        {tab === "Registration types" && (
          <section className="form-stack">
            <div className="row-heading">
              <div>
                <h2>A welcome for every kind of guest.</h2>
                <p>Free registration, with a capacity for each category.</p>
              </div>
              <Button
                disabled={config.types.length >= 12}
                onClick={() =>
                  setConfig({
                    types: [
                      ...config.types,
                      {
                        id: crypto.randomUUID(),
                        name: "General admission",
                        description: "",
                        capacity: 100,
                        approval: false,
                      },
                    ],
                  })
                }
              >
                <Plus size={16} />
                Add registration type
              </Button>
            </div>
            {!config.types.length && (
              <div className="panel empty-state">
                <h3>Who are you bringing together?</h3>
                <p>Add your first registration type to open the doors.</p>
              </div>
            )}
            {config.types.map((type, index) => {
              const update = (v: Partial<typeof type>) =>
                setConfig({
                  types: config.types.map((t) =>
                    t.id === type.id ? { ...t, ...v } : t,
                  ),
                });
              return (
                <article className="panel form-stack" key={type.id}>
                  <div className="row-heading">
                    <h3>Type {index + 1}</h3>
                    <Button
                      variant="ghost"
                      aria-label={"Remove " + type.name}
                      onClick={() =>
                        setConfig({
                          types: config.types.filter((t) => t.id !== type.id),
                        })
                      }
                    >
                      <Trash2 size={16} />
                      Remove
                    </Button>
                  </div>
                  <div className="form-grid">
                    <FormControl label="Type name">
                      <input
                        value={type.name}
                        maxLength={80}
                        onChange={(e) => update({ name: e.target.value })}
                      />
                    </FormControl>
                    <FormControl label="Capacity">
                      <input
                        type="number"
                        min={1}
                        max={100000}
                        value={type.capacity}
                        onChange={(e) =>
                          update({ capacity: Number(e.target.value) })
                        }
                      />
                    </FormControl>
                  </div>
                  <FormControl label="Type description">
                    <textarea
                      value={type.description}
                      maxLength={500}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </FormControl>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={type.approval}
                      onChange={(e) => update({ approval: e.target.checked })}
                    />
                    Review registrations before approving
                  </label>
                  <small>
                    Pending registrations reserve a place. Removing a type
                    closes it to new registrations after republishing; its
                    history is retained.
                  </small>
                </article>
              );
            })}
          </section>
        )}
        {tab === "Form" && (
          <FormBuilder
            fields={config.fields}
            onChange={(fields) => setConfig({ fields })}
          />
        )}
        {tab === "Branding" && (
          <BrandingEditor
            id={id}
            value={config.branding}
            onChange={(branding) => setDraft((current) => ({ ...current, config: { ...current.config, branding: { ...current.config.branding, ...branding } } }))}
          />
        )}
        {tab === "Publish" && (
          <section className="panel form-stack">
            <div>
              <span className="eyebrow">READY FOR YOUR PEOPLE</span>
              <h2>
                {published
                  ? "A new version, a fresh welcome."
                  : "From a good idea to open doors."}
              </h2>
              <p>
                Publishing takes a snapshot of your event, form and branding.
                Existing registrations keep the version they used.
              </p>
            </div>
            <ul className="publish-checklist">
              {problems.length
                ? problems.map((p) => <li key={p}>{p}</li>)
                : [
                    "Event information is complete",
                    "Registration types are ready",
                    "Form and branding are ready",
                    "On-screen confirmation is included",
                  ].map((p) => (
                    <li key={p}>
                      <Check size={18} />
                      {p}
                    </li>
                  ))}
            </ul>
            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
            <Button
              disabled={publishing || busy || problems.length > 0}
              onClick={async () => {
                setPublishing(true);
                setMessage("");
                try {
                  const saved = await flush();
                  if (!saved.ok) {
                    setMessage(saved.message);
                    return;
                  }
                  const result = await publishEvent(id, saved.revision);
                  if (result.ok) {
                    router.refresh();
                    setMessage("Published. Your registration page is ready.");
                    router.push(
                      "/dashboard/events/" + id + "/preview?published=1",
                    );
                  } else setMessage(result.message);
                } catch {
                  setMessage("Publishing failed. Please retry.");
                } finally {
                  setPublishing(false);
                }
              }}
            >
              {publishing
                ? "Publishing…"
                : published
                  ? "Publish updated version"
                  : "Publish event"}
            </Button>
            {published && (
              <Link className="text-link" href={"/e/" + basics.slug}>
                Open public registration →
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
