import { CalendarDays } from "lucide-react";
import { Shell } from "@/components/shared/shell";
import { workspace } from "@/server/services/organizations";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
export default async function Dashboard() {
  const { db, organization } = await workspace("event.read");
  const { data: events, error } = await db
    .from("events")
    .select("id,name,starts_at,timezone")
    .eq("organization_id", organization.id)
    .order("starts_at")
    .limit(20);
  if (error) throw error;
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
            <h2>Your events</h2>
            <span className="muted">Foundation preview</span>
          </div>
          {events.length ? (
            <div className="event-grid">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-card-body">
                    <h3>{event.name}</h3>
                    <p>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "long",
                        timeZone: event.timezone,
                      }).format(new Date(event.starts_at))}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays />
                </EmptyMedia>
                <EmptyTitle>Your next gathering starts here.</EmptyTitle>
                <EmptyDescription>
                  Your workspace is ready. Event creation is the next
                  development milestone.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </main>
    </Shell>
  );
}
