export function brandingLogoUrl(path: string) {
  return (
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") +
    "/storage/v1/object/public/amel-event-branding/" +
    path
  );
}
