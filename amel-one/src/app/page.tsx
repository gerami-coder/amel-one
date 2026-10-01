import Link from "next/link";
import {
  ArrowRight,
  Check,
  Layers,
  MousePointer2,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { EventPreview } from "@/components/shared/event-preview";
import { brand } from "@/config/brand";
export default function Home() {
  return (
    <>
      <header className="site-header wrap">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/demo">Explore demo</Link>
        </nav>
        <div className="header-actions">
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="button small">
            Create your event <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="signal" /> MADE FOR PEOPLE WHO BRING PEOPLE
              TOGETHER
            </span>
            <h1>
              Great events.
              <br />A better
              <br />
              <em>beginning.</em>
            </h1>
            <p>
              From the first invitation to a room full of possibilities. Give
              every event a thoughtful registration experience.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="button">
                Create your event <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="text-link">
                Take a look around <ArrowRight size={16} />
              </Link>
            </div>
            <p className="hero-note">
              <Check size={14} /> Built for your brand. Designed for your
              guests.
            </p>
          </div>
          <div className="hero-visual">
            <div className="visual-caption">
              <span className="signal" /> YOUR NEXT BIG MOMENT STARTS HERE
            </div>
            <EventPreview compact />
            <div className="guest-note">
              <span className="guest-check">
                <Check size={20} />
              </span>
              <span>
                <strong>You’re on the list.</strong>
                <small>A warm welcome, from the very first click.</small>
              </span>
            </div>
            <div className="visual-foot">
              <span>01 / A seamless first impression</span>
              <Sparkles size={18} />
            </div>
          </div>
        </section>
        <section className="promise-strip">
          <div className="wrap">
            <span>Conferences</span>
            <span>Exhibitions</span>
            <span>Workshops</span>
            <span>Community gatherings</span>
          </div>
        </section>
        <section id="product" className="section wrap">
          <div className="section-heading">
            <span className="eyebrow">LESS ADMIN. MORE POSSIBILITY.</span>
            <h2>
              Every detail.
              <br />
              <em>One clear view.</em>
            </h2>
            <p>
              A considered workspace for the people behind the event. Shape the
              experience, see who’s coming, and stay ready for what comes next.
            </p>
          </div>
          <div className="product-window">
            <div className="window-top">
              <Brand />
              <span>Sample workspace · illustrative data</span>
            </div>
            <div className="preview-heading">
              <div>
                <span className="eyebrow">AMEL EVENTS</span>
                <h3>Your events, coming together.</h3>
              </div>
              <Link href="/demo" className="text-link">
                Explore workspace <ArrowRight size={16} />
              </Link>
            </div>
            <EventPreview />
          </div>
        </section>
        <section id="how-it-works" className="section wrap">
          <div className="section-heading">
            <span className="eyebrow">FROM IDEA TO OPEN DOORS</span>
            <h2>
              A little setup.
              <br />
              <em>A lot to look forward to.</em>
            </h2>
          </div>
          <div className="steps">
            <article>
              <span>01</span>
              <Layers />
              <h3>Make it yours</h3>
              <p>
                Start with the essentials. Bring your event’s identity into a
                clear, welcoming experience.
              </p>
            </article>
            <article>
              <span>02</span>
              <MousePointer2 />
              <h3>Welcome your people</h3>
              <p>
                Ask the right questions and make signing up feel effortless, on
                any screen.
              </p>
            </article>
            <article>
              <span>03</span>
              <Sparkles />
              <h3>See it come together</h3>
              <p>
                Keep your team and attendees in view as your event takes shape.
              </p>
            </article>
          </div>
        </section>
        <section className="closing wrap">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>
            Bring people together.
            <br />
            <em>We’ll help with the beginning.</em>
          </h2>
          <Link href="/signup" className="button light">
            Create your event <ArrowRight size={18} />
          </Link>
          <p>Development preview · registration tools are being built.</p>
        </section>
      </main>
      <footer className="site-footer wrap">
        <Brand />
        <p>{brand.tagline}</p>
        <span>
          © {new Date().getFullYear()} {brand.company}
        </span>
      </footer>
    </>
  );
}
