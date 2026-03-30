"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { RsvpSection } from "@/components/attendance/rsvp-section";
import { AttendancePanel } from "@/components/attendance/attendance-panel";
import { EventCompositionPicker } from "@/components/compositions/event-composition-picker";
import { Music, Paperclip } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { hasEventStarted } from "@/lib/utils/event-time";
import { toast } from "sonner";
import type { Event, AttendanceWithMember, Composition } from "@/lib/db/repositories";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

export function EventDetailClient({
  event,
  initialAttendance,
  currentMemberId,
  isAdmin,
  isDirectorOrAdmin,
  canEdit,
  linkedCompositions,
  allCompositions,
  attachmentCounts,
}: {
  event: Event;
  initialAttendance: AttendanceWithMember[];
  currentMemberId: string;
  isAdmin: boolean;
  isDirectorOrAdmin: boolean;
  canEdit: boolean;
  linkedCompositions: Composition[];
  allCompositions: Composition[];
  attachmentCounts: Record<string, number>;
}) {
  const t = useTranslations();
  const [attendance, setAttendance] = useState(initialAttendance);

  const eventStarted = hasEventStarted(event.date, event.time);
  const currentUserAttendance = attendance.find(
    (a) => a.memberId === currentMemberId
  );
  const currentStatus = currentUserAttendance?.status ?? "unset";
  const currentNote = currentUserAttendance?.note ?? null;
  const canChangeOwn = !eventStarted || isDirectorOrAdmin;

  const handleStatusChange = async (
    memberId: string,
    status: PresenceStatus
  ) => {
    const previous = [...attendance];
    setAttendance((prev) =>
      prev.map((a) => (a.memberId === memberId ? { ...a, status } : a))
    );

    try {
      const body: { status: string; memberId?: string } = { status };
      if (memberId !== currentMemberId) {
        body.memberId = memberId;
      }

      const res = await fetch(`/api/events/${event.id}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setAttendance(previous);
        toast.error(t("toast.error"));
      }
    } catch {
      setAttendance(previous);
      toast.error(t("toast.networkError"));
    }
  };

  const handleNoteChange = (newNote: string | null) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.memberId === currentMemberId ? { ...a, note: newNote } : a
      )
    );
  };

  return (
    <>
      <Separator className="my-6" />
      <RsvpSection
        eventId={event.id}
        status={currentStatus}
        note={currentNote}
        onStatusChange={(s) => handleStatusChange(currentMemberId, s)}
        onNoteChange={handleNoteChange}
        disabled={!canChangeOwn}
        disabledMessage={
          eventStarted && !isDirectorOrAdmin
            ? t("presence.eventStarted")
            : undefined
        }
      />

      <Separator className="my-6" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Music className="h-4 w-4" />
            {t("compositions.title")}
          </h3>
          {canEdit && (
            <EventCompositionPicker
              eventId={event.id}
              allCompositions={allCompositions}
              linkedCompositions={linkedCompositions}
            />
          )}
        </div>
        {linkedCompositions.length > 0 ? (
          <ul className="space-y-1">
            {linkedCompositions.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <Link
                  href={`/compositions/${c.id}`}
                  className="text-sm hover:underline"
                >
                  {c.name} — {c.author}
                </Link>
                {(attachmentCounts[c.id] ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    {attachmentCounts[c.id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      <Separator className="my-6" />
      <AttendancePanel
        attendance={attendance}
        currentMemberId={currentMemberId}
        isAdmin={isAdmin}
        isDirectorOrAdmin={isDirectorOrAdmin}
        eventStarted={eventStarted}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
