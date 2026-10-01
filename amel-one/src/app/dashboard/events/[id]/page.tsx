import { eventWorkspace } from "@/server/services/events";
import { EventFrame } from "@/components/shared/event-frame";
import { EventEditor } from "@/features/events/event-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event, organization, draft } = await eventWorkspace(
    id,
    "event.update",
  );
  return (
    <EventFrame organization={organization.name} id={id} name={event.name}>
      <EventEditor
        key={id}
        id={id}
        initial={draft}
        revision={event.revision}
        published={!!event.published_at}
      />
    </EventFrame>
  );
}
