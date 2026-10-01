import Link from "next/link";
import { Shell } from "./shell";
export function EventFrame({
  organization,
  id,
  name,
  children,
}: {
  organization: string;
  id: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Shell organization={organization}>
      <main id="main" className="dashboard-main">
        <Link className="back-link" href="/dashboard">
          ← All events
        </Link>
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR EVENT</span>
            <h1>{name}</h1>
          </div>
          <nav className="button-row" aria-label="Event navigation">
            <Link className="button outline" href={"/dashboard/events/" + id}>
              Event setup
            </Link>
            <Link
              className="button outline"
              href={"/dashboard/events/" + id + "/registrations"}
            >
              Registrations
            </Link>
          </nav>
        </div>
        {children}
      </main>
    </Shell>
  );
}
