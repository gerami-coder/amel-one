import Link from "next/link";
import { Plus, CalendarDays, ArrowUpRight } from "lucide-react";
import { Shell } from "@/components/shared/shell";
import { workspace } from "@/server/services/organizations";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { can } from "@/server/permissions";
import { eventStage } from "@/features/events/lifecycle";
export default async function Dashboard() {
  const { db, organization, membership } = await workspace("event.read");
  const { data: events, error } = await db
    .from("events")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Events could not be loaded");
  const edit = can(membership, organization.id, "event.update");
  return (
    <Shell organization={organization.name}>
      <main id="main" className="dashboard-main">
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h1>Welcome to {organization.name}.</h1>
            <p>A clear place for every event you bring to life.</p>
          </div>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Log out
            </Button>
          </form>
        </div>
        <section id="events">
          <div className="row-heading">
            <h2>
              Your events <span className="muted">{events.length}</span>
            </h2>
            {can(membership, organization.id, "event.create") && (
              <Button asChild>
                <Link href="/dashboard/events/new">
                  <Plus size={16} />
                  Create event
                </Link>
              </Button>
            )}
          </div>
          {events.length ? (
            <div className="event-grid">
              {events.map((event, index) => (
                <article className="event-card" key={event.id}>
                  <div
                    className={
                      "event-art " + ["teal", "sand", "clay"][index % 3]
                    }
                  >
                    <span>{event.event_type.toUpperCase()}</span>
                    <strong>
                      {event.name
                        .split(" ")
                        .slice(0, 2)
                        .map((x) => x[0])
                        .join("")}
                      <span>{new Date(event.starts_at).getUTCFullYear()}</span>
                    </strong>
                    <div className="art-ring" />
                    <ArrowUpRight />
                  </div>
                  <div className="event-card-body">
                    <span className="status">
                      {eventStage({
                        publishedAt: event.published_at,
                        startsAt: event.starts_at,
                        endsAt: event.ends_at,
                        registrationClosesAt: event.registration_closes_at,
                      })}
                    </span>
                    <h3>
                      <Link
                        href={
                          "/dashboard/events/" +
                          event.id +
                          (edit ? "" : "/registrations")
                        }
                      >
                        {event.name}
                      </Link>
                    </h3>
                    <p>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "long",
                        timeZone: event.timezone,
                      }).format(new Date(event.starts_at))}
                    </p>
                    <p>{event.location || "Location to be added"}</p>
                    <div className="card-links">
                      <Link
                        className="text-link"
                        href={
                          "/dashboard/events/" +
                          event.id +
                          (edit ? "" : "/registrations")
                        }
                      >
                        {edit ? "Continue setup" : "View registrations"} →
                      </Link>
                      {event.published_at && (
                        <Link href={"/e/" + event.slug}>Public page ↗</Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <CalendarDays size={32} />
              <h2>Your next gathering starts here.</h2>
              <p>
                Create your event, shape its registration experience, and
                welcome your first guests.
              </p>
              {can(membership, organization.id, "event.create") && (
                <Button asChild>
                  <Link href="/dashboard/events/new">
                    Create your first event
                  </Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}
