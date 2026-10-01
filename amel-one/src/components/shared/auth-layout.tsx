import { Brand } from "./brand";
import { brand } from "@/config/brand";
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">EVERY GREAT EVENT STARTS SOMEWHERE</span>
          <h2>
            Make room
            <br />
            for <em>possibility.</em>
          </h2>
          <p>
            A thoughtful beginning for your next gathering. Your people, your
            brand, your workspace.
          </p>
        </div>
        <span>
          {brand.tagline} · {brand.company}
        </span>
      </aside>
      <main id="main" className="auth-main">
        <div className="auth-box">{children}</div>
      </main>
    </div>
  );
}
