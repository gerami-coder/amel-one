import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Shell } from "@/components/shared/shell";
import { EventPreview } from "@/components/shared/event-preview";
export default function Demo() {
  return (
    <Shell organization="Amel Events" demo>
      <main id="main" className="dashboard-main">
        <div className="demo-banner">
          <span>
            You’re exploring a sample workspace. All event and attendee data is
            fictional.
          </span>
          <Link href="/signup">
            Create your workspace <ArrowRight size={14} />
          </Link>
        </div>
        <div className="page-heading">
          <div>
            <span className="eyebrow">A LITTLE CLARITY FOR YOUR DAY</span>
            <h1>Your events, coming together.</h1>
            <p>Big ideas. Thoughtful details. It all starts here.</p>
          </div>
          <span className="date-label">
            <CalendarDays size={16} /> Sample season · 2027
          </span>
        </div>
        <div className="stats">
          <div>
            <span>Events in motion</span>
            <strong>
              3 <small>this season</small>
            </strong>
          </div>
          <div>
            <span>People on the list</span>
            <strong>
              1,029 <small>sample registrations</small>
            </strong>
          </div>
          <div>
            <span>Your next gathering</span>
            <strong>
              12 Feb <small>Leaders in Motion</small>
            </strong>
          </div>
        </div>
        <section id="events">
          <div className="row-heading">
            <h2>
              In your calendar <span>3</span>
            </h2>
            <span className="muted">A season of possibilities</span>
          </div>
          <EventPreview />
        </section>
        <section className="next-moment">
          <span className="eyebrow">THE EVENT JOURNEY</span>
          <h2>The right focus, at the right time.</h2>
          <ol className="lifecycle">
            {["Build", "Register", "Prepare", "Live", "Review"].map(
              (step, i) => (
                <li key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ),
            )}
          </ol>
          <p>
            Each event has its own rhythm. Your workspace will follow along.
          </p>
        </section>
      </main>
    </Shell>
  );
}
