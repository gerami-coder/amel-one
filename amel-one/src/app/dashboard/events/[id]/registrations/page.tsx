import Link from "next/link";
import { registrations } from "@/server/services/registrations";
import { EventFrame } from "@/components/shared/event-frame";
import { RegistrationsTable } from "@/features/registration/registrations-table";
import { Button } from "@/components/ui/button";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { id } = await params;
  const c = await registrations(id, await searchParams);
  const link = (page: number) =>
    "?" +
    new URLSearchParams({
      q: c.search,
      status: c.status ?? "",
      page: String(page),
    });
  return (
    <EventFrame id={id} organization={c.organization.name} name={c.event.name}>
      <section className="panel form-stack">
        <div className="row-heading">
          <div>
            <span className="eyebrow">THE PEOPLE MAKE THE EVENT</span>
            <h2>
              Registrations <span className="muted">{c.total}</span>
            </h2>
          </div>
          {c.event.published_at && (
            <Link className="text-link" href={"/e/" + c.event.slug}>
              Public event page →
            </Link>
          )}
        </div>
        <form className="filter-bar">
          <label>
            Search attendees
            <input
              name="q"
              defaultValue={c.search}
              placeholder="Name or email"
              maxLength={100}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={c.status}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <Button type="submit" variant="outline">
            Apply filters
          </Button>
        </form>
        {c.rows.length ? (
          <RegistrationsTable rows={c.rows} eventId={id} />
        ) : (
          <div className="empty-state">
            <h3>
              {c.search || c.status
                ? "No matches yet."
                : "Your guest list starts here."}
            </h3>
            <p>
              {c.search || c.status
                ? "Try a different search or status."
                : "Publish your event and share its link to welcome your first registration."}
            </p>
          </div>
        )}
        <div className="pagination">
          <span>
            {c.total} results · Page {c.page} of{" "}
            {Math.max(1, Math.ceil(c.total / 25))}
          </span>
          <div className="button-row">
            {c.page > 1 && <Link href={link(c.page - 1)}>← Previous</Link>}
            {c.page * 25 < c.total && (
              <Link href={link(c.page + 1)}>Next →</Link>
            )}
          </div>
        </div>
      </section>
    </EventFrame>
  );
}
