import Link from "next/link";
import { Brand } from "@/components/shared/brand";
export default function NotFound() {
  return (
    <main id="main" className="recovery">
      <Brand />
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>
        This link leads
        <br />
        somewhere else.
      </h1>
      <p>
        The page or event may be unavailable. Check the link or head back to the
        beginning.
      </p>
      <Link href="/" className="button">
        Back to home
      </Link>
    </main>
  );
}
