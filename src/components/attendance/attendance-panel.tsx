"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceSummary } from "./attendance-summary";
import { AttendanceDetail } from "./attendance-detail";
import type { AttendanceWithMember } from "@/lib/db/repositories";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

export function AttendancePanel({
  attendance,
  currentMemberId,
  isAdmin,
  isDirectorOrAdmin,
  eventStarted,
  onStatusChange,
}: {
  attendance: AttendanceWithMember[];
  currentMemberId: string;
  isAdmin: boolean;
  isDirectorOrAdmin: boolean;
  eventStarted: boolean;
  onStatusChange: (memberId: string, status: PresenceStatus) => void;
}) {
  const t = useTranslations("presence");

  const counts = { yes: 0, maybe: 0, no: 0, unset: 0 };
  for (const a of attendance) {
    counts[a.status]++;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("title")}</h3>

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
            onStatusChange={onStatusChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
