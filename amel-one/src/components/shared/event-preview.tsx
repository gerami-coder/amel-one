import { ArrowUpRight, MapPin } from "lucide-react";
import { demoEvents } from "@/features/events/demo-data";
export function EventPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "event-grid compact" : "event-grid"}>
      {demoEvents.slice(0, compact ? 1 : 3).map((event) => (
        <article className="event-card" key={event.id}>
          <div className={`event-art ${event.color}`} aria-hidden="true">
            <div className="art-ring" />
            <span>{event.kind}</span>
            <strong>
              {event.id === "expo" ? (
                <>
                  AB
                  <br />
                  EXPO<span>2027</span>
                </>
              ) : event.id === "creative" ? (
                <>
                  The
                  <br />
                  Exchange.
                </>
              ) : (
                <>
                  Leaders
                  <br />
                  in motion.
                </>
              )}
            </strong>
            <ArrowUpRight />
          </div>
          <div className="event-card-body">
            <span className={`status ${event.stage.toLowerCase()}`}>
              {event.stage === "REGISTER"
                ? "Registration open"
                : event.stage === "BUILD"
                  ? "Draft"
                  : "Preparing"}
            </span>
            <h3>{event.name}</h3>
            <p>{event.date}</p>
            <p className="event-location">
              <MapPin size={14} />
              {event.location}
            </p>
            <div className="capacity">
              <span>
                <strong>{event.registrations}</strong> / {event.capacity}{" "}
                registrations
              </span>
              <span>
                {Math.round((event.registrations / event.capacity) * 100)}%
              </span>
            </div>
            <progress
              aria-label={`${event.name} registration capacity`}
              value={event.registrations}
              max={event.capacity}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
