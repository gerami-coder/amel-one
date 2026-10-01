"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="recovery">
      <span className="eyebrow">LET’S TRY THAT AGAIN</span>
      <h1>We couldn’t load this page.</h1>
      <p>Your work may still be available. Try again or return home.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <Link href="/">Return home</Link>
    </main>
  );
}
