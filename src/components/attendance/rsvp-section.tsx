"use client";

import { PresenceButton } from "./presence-button";
import { PresenceNote } from "./presence-note";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

export function RsvpSection({
  eventId,
  status,
  note,
  onStatusChange,
  onNoteChange,
  disabled,
  disabledMessage,
}: {
  eventId: string;
  status: PresenceStatus;
  note: string | null;
  onStatusChange: (status: PresenceStatus) => void;
  onNoteChange: (note: string | null) => void;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">RSVP</h3>
      <PresenceButton
        status={status}
        onStatusChange={onStatusChange}
        disabled={disabled}
      />
      <PresenceNote
        eventId={eventId}
        note={note}
        onNoteChange={onNoteChange}
        disabled={disabled}
      />
      {disabledMessage && (
        <p className="text-xs text-muted-foreground">{disabledMessage}</p>
      )}
    </div>
  );
}
