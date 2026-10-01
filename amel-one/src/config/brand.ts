export const brand = {
  name: "Amel One",
  company: "Amel Events",
  tagline: "One platform. Every event.",
  description:
    "Branded registration and thoughtful event operations, together in one place.",
  website: process.env.APP_URL ?? "http://localhost:3000",
  supportEmail: null,
  logo: "/brand-mark.svg",
  favicon: "/brand-mark.svg",
  social: { title: "Amel One — One platform. Every event." },
} as const;
