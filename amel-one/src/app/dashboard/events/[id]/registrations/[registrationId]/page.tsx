import Link from "next/link";
import { z } from "zod";
import { registrationDetail } from "@/server/services/registrations";
import { EventFrame } from "@/components/shared/event-frame";
import { snapshotSchema } from "@/features/events/contracts";
import { ReviewControls } from "@/features/registration/review-controls";
import { can } from "@/server/permissions";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; registrationId: string }>;
}) {
  const { id, registrationId } = await params;
  const c = await registrationDetail(id, registrationId);
  const r = c.registration;
  const snapshot = snapshotSchema.parse(r.event_versions?.snapshot);
  const answers = z
    .record(z.string(), z.union([z.string(), z.boolean()]))
    .parse(c.answers);
  return (
    <EventFrame id={id} organization={c.organization.name} name={c.event.name}>
      <Link
        className="back-link"
        href={"/dashboard/events/" + id + "/registrations"}
      >
        ← Registration list
      </Link>
      <div className="detail-grid">
        <section className="panel form-stack">
          <span className={"status " + r.status}>{r.status}</span>
          <h2>{r.full_name}</h2>
          <p>{r.email}</p>
          <dl className="detail-list">
            <dt>Registration type</dt>
            <dd>
              {snapshot.config.types.find((t) => t.id === r.type_id)?.name}
            </dd>
            <dt>Reference</dt>
            <dd>{r.reference}</dd>
            <dt>Form version</dt>
            <dd>{r.event_versions?.version}</dd>
            <dt>Registered</dt>
            <dd>
              {new Date(r.created_at).toLocaleString("en", {
                timeZone: c.event.timezone,
              })}
            </dd>
          </dl>
          {r.status === "pending" && (
            <ReviewControls
              id={r.id}
              approve={can(
                c.membership,
                c.organization.id,
                "registration.approve",
              )}
              reject={can(
                c.membership,
                c.organization.id,
                "registration.reject",
              )}
            />
          )}
        </section>
        <section className="panel form-stack">
          <h2>Registration answers</h2>
          <p>
            These labels and answers belong to the form version used at
            registration.
          </p>
          {snapshot.config.fields.length ? (
            <dl className="detail-list">
              {snapshot.config.fields.map((f) => (
                <div key={f.id}>
                  <dt>{f.label}</dt>
                  <dd>
                    {typeof answers[f.id] === "boolean"
                      ? answers[f.id]
                        ? "Yes"
                        : "No"
                      : answers[f.id] || "Not provided"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No additional questions were asked.</p>
          )}
          <h3>Status history</h3>
          <ol className="history">
            {c.history.map((h, i) => (
              <li key={i}>
                <strong>{h.to_status}</strong>
                <span>
                  {new Date(h.created_at).toLocaleString("en", {
                    timeZone: c.event.timezone,
                  })}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </EventFrame>
  );
}
