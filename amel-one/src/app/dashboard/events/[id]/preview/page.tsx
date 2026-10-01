import Link from "next/link";
import { eventWorkspace } from "@/server/services/events";
import { PublicExperience } from "@/features/registration/public-experience";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event, draft } = await eventWorkspace(id);
  return (
    <>
      <nav className="preview-bar">
        <span>Draft preview · submissions are disabled</span>
        <Link href={"/dashboard/events/" + id}>← Return to setup</Link>
        {event.published_at && (
          <Link href={"/e/" + event.slug}>Open published page →</Link>
        )}
      </nav>
      <PublicExperience
        preview
        requestId={crypto.randomUUID()}
        event={{
          id,
          versionId: event.active_version_id ?? id,
          snapshot: { ...draft.basics, config: draft.config },
          availability: Object.fromEntries(
            draft.config.types.map((t) => [t.id, t.capacity]),
          ),
        }}
      />
    </>
  );
}
