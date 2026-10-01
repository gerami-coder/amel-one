import type { Metadata } from "next";
import { brand } from "@/config/brand";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: brand.social.title, template: `%s · ${brand.name}` },
  description: brand.description,
  icons: { icon: brand.favicon },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
