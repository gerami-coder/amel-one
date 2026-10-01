import { publicEvent } from "@/server/services/events";
import { PublicExperience } from "@/features/registration/public-experience";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await publicEvent(slug);
  return <PublicExperience event={event} requestId={crypto.randomUUID()} />;
}
