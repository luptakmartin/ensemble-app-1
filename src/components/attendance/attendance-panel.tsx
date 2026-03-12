"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresenceButton } from "./presence-button";
import { AttendanceSummary } from "./attendance-summary";
import { AttendanceDetail } from "./attendance-detail";
import { hasEventStarted } from "@/lib/utils/event-time";
import type { Event, AttendanceWithMember } from "@/lib/db/repositories";
import { toast } from "sonner";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

export function AttendancePanel({
  event,
  attendance: initialAttendance,
  currentMemberId,
  isAdmin,
  isDirectorOrAdmin,
}: {
  event: Event;
  attendance: AttendanceWithMember[];
  currentMemberId: string;
  isAdmin: boolean;
  isDirectorOrAdmin: boolean;
}) {
  const t = useTranslations("presence");
  const tToast = useTranslations("toast");
  const [attendance, setAttendance] = useState(initialAttendance);

  const eventStarted = hasEventStarted(event.date, event.time);
  const currentUserAttendance = attendance.find(
    (a) => a.memberId === currentMemberId
  );
  const currentStatus = currentUserAttendance?.status ?? "unset";
  const canChangeOwn = !eventStarted || isDirectorOrAdmin;

  const counts = { yes: 0, maybe: 0, no: 0, unset: 0 };
  for (const a of attendance) {
    counts[a.status]++;
  }

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
        toast.error(tToast("error"));
      }
    } catch {
      setAttendance(previous);
      toast.error(tToast("networkError"));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("title")}</h3>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{t("yourStatus")}</p>
        <PresenceButton
          status={currentStatus}
          onStatusChange={(s) => handleStatusChange(currentMemberId, s)}
          disabled={!canChangeOwn}
        />
        {eventStarted && !isDirectorOrAdmin && (
          <p className="text-xs text-muted-foreground">{t("eventStarted")}</p>
        )}
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">{t("summary")}</TabsTrigger>
          <TabsTrigger value="detail">{t("detail")}</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <AttendanceSummary counts={counts} total={attendance.length} />
        </TabsContent>
        <TabsContent value="detail">
          <AttendanceDetail
            attendance={attendance}
            currentMemberId={currentMemberId}
            canEditOthers={isAdmin}
            eventStarted={eventStarted}
            isDirectorOrAdmin={isDirectorOrAdmin}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
