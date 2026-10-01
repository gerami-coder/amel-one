import Link from "next/link";
import { workspace } from "@/server/services/organizations";
import { Shell } from "@/components/shared/shell";
import { NewEvent } from "@/features/events/new-event";
export default async function Page() {
  const { organization } = await workspace("event.create");
  return (
    <Shell organization={organization.name}>
      <main id="main" className="dashboard-main">
        <Link className="back-link" href="/dashboard">
          ← All events
        </Link>
        <div className="page-heading">
          <div>
            <span className="eyebrow">MAKE SOMETHING HAPPEN</span>
            <h1>A new event starts here.</h1>
          </div>
        </div>
        <div className="narrow-form">
          <NewEvent />
        </div>
      </main>
    </Shell>
  );
}
