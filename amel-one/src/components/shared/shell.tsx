import { brand } from "@/config/brand";
import Link from "next/link";
import { Brand } from "./brand";
import {
  ArrowUpRight,
  CalendarDays,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
export function Shell({
  children,
  organization,
  demo = false,
}: {
  children: React.ReactNode;
  organization: string;
  demo?: boolean;
}) {
  const navigation = (
    <>
      <Link href={demo ? "/demo" : "/dashboard"}>
        <LayoutDashboard size={18} /> Overview
      </Link>
      <Link href={demo ? "/demo#events" : "/dashboard#events"}>
        <CalendarDays size={18} /> Events
      </Link>
    </>
  );
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">WORKSPACE</div>
        <div className="organization">
          <span className="org-avatar">{organization.slice(0, 1)}</span>
          <strong>{organization}</strong>
        </div>
        <nav aria-label="Workspace navigation">{navigation}</nav>
        <div className="sidebar-note">
          <Sparkles size={20} />
          <p>
            Room for your next
            <br />
            great gathering.
          </p>
          <span>{brand.tagline}</span>
        </div>
        <Link href="/" className="back-link">
          Visit website <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="workspace-body">
        <header className="workspace-top">
          <span>
            {organization} <span className="muted">/</span> Overview
          </span>
          <span className="small-label">
            {demo ? "DEMO WORKSPACE" : "YOUR WORKSPACE"}
          </span>
        </header>
        <details className="mobile-nav">
          <summary>Workspace menu</summary>
          <nav aria-label="Mobile workspace navigation">
            {navigation}
            <Link href="/">Visit website</Link>
          </nav>
        </details>
        {children}
      </div>
    </div>
  );
}
