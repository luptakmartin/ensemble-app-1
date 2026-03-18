"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import { Check, HelpCircle, X, Minus } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { PresenceButton } from "@/components/attendance/presence-button";
import { PresenceNote } from "@/components/attendance/presence-note";
import { toast } from "sonner";
import type { Event, Member, AttendanceWithMember } from "@/lib/db/repositories";

const dateLocales: Record<string, Locale> = { cs, sk, en: enUS };

const voiceGroupOrder = ["S", "A", "T", "B", null] as const;

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

const statusConfig: Record<string, { icon: typeof Check; colorClass: string }> = {
  yes: { icon: Check, colorClass: "text-green-600" },
  maybe: { icon: HelpCircle, colorClass: "text-blue-600" },
  no: { icon: X, colorClass: "text-red-600" },
  unset: { icon: Minus, colorClass: "text-gray-400" },
};

interface CellPopup {
  memberId: string;
  eventId: string;
  memberName: string;
  eventName: string;
  status: PresenceStatus;
  note: string | null;
  x: number;
  y: number;
  canEdit: boolean;
}

interface StatisticsTableProps {
  events: Event[];
  members: Member[];
  attendance: AttendanceWithMember[];
  currentMemberId: string;
  isDirectorOrAdmin: boolean;
  onAttendanceUpdate: (memberId: string, eventId: string, status: string, note: string | null) => void;
}

export function StatisticsTable({
  events,
  members,
  attendance,
  currentMemberId,
  isDirectorOrAdmin,
  onAttendanceUpdate,
}: StatisticsTableProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [popup, setPopup] = useState<CellPopup | null>(null);

  // Build lookup: `${memberId}-${eventId}` -> { status, note }
  const lookup = new Map<string, { status: string; note: string | null }>();
  for (const a of attendance) {
    lookup.set(`${a.memberId}-${a.eventId}`, { status: a.status, note: a.note });
  }

  // Group members by voice group
  const grouped = new Map<string | null, Member[]>();
  for (const vg of voiceGroupOrder) {
    grouped.set(vg, []);
  }
  for (const member of members) {
    const key = member.voiceGroup;
    const list = grouped.get(key);
    if (list) {
      list.push(member);
    } else {
      grouped.get(null)!.push(member);
    }
  }
  // Sort members within each group alphabetically
  for (const list of grouped.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const dateFormat = locale === "en" ? "MMM d, yy" : "d.M.yy";
  const dateLoc = dateLocales[locale] || dateLocales.en;
  const now = new Date();
  const pastEventIds = new Set(events.filter((e) => new Date(e.date) < now).map((e) => e.id));

  const handleCellClick = (
    e: React.MouseEvent,
    member: Member,
    event: Event,
    record: { status: string; note: string | null } | undefined
  ) => {
    const isSelf = member.id === currentMemberId;
    const canEdit = isSelf || isDirectorOrAdmin;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopup({
      memberId: member.id,
      eventId: event.id,
      memberName: member.name,
      eventName: event.name,
      status: (record?.status ?? "unset") as PresenceStatus,
      note: record?.note ?? null,
      x: Math.min(rect.left + rect.width / 2, window.innerWidth - 180),
      y: rect.bottom + 4,
      canEdit,
    });
  };

  const handleStatusChange = useCallback(async (newStatus: PresenceStatus) => {
    if (!popup) return;
    const isSelf = popup.memberId === currentMemberId;

    const body: Record<string, unknown> = { status: newStatus };
    if (!isSelf) body.memberId = popup.memberId;

    try {
      const res = await fetch(`/api/events/${popup.eventId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onAttendanceUpdate(popup.memberId, popup.eventId, newStatus, popup.note);
        setPopup((prev) => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error(t("toast.error"));
      }
    } catch {
      toast.error(t("toast.networkError"));
    }
  }, [popup, currentMemberId, onAttendanceUpdate, t]);

  const handleNoteChange = useCallback((newNote: string | null) => {
    if (!popup) return;
    onAttendanceUpdate(popup.memberId, popup.eventId, popup.status, newNote);
    setPopup((prev) => prev ? { ...prev, note: newNote } : null);
  }, [popup, onAttendanceUpdate]);

  return (
    <div className="relative">
      {/* Cell popup */}
      {popup && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopup(null)}
          />
          <div
            className="fixed z-50 bg-popover text-popover-foreground border rounded-md shadow-lg p-3 w-auto max-w-[90vw]"
            style={{ left: popup.x, top: popup.y, transform: "translateX(-50%)" }}
          >
            <div className="mb-2">
              <p className="font-medium text-sm">{popup.memberName}</p>
              <p className="text-xs text-muted-foreground">{popup.eventName}</p>
            </div>
            {popup.canEdit ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <PresenceButton
                    status={popup.status}
                    onStatusChange={handleStatusChange}
                  />
                </div>
                <PresenceNote
                  eventId={popup.eventId}
                  note={popup.note}
                  onNoteChange={handleNoteChange}
                  memberId={popup.memberId !== currentMemberId ? popup.memberId : undefined}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm">{t(`presence.${popup.status}`)}</p>
                {popup.note && (
                  <p className="text-sm text-muted-foreground">{popup.note}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="overflow-auto max-h-[70vh] border rounded-md">
        <table className="border-collapse min-w-max">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-20 bg-muted px-3 py-2 text-left text-sm font-medium border-r min-w-[180px]">
                {t("members.title")}
              </th>
              {events.map((event) => (
                <th key={event.id} className={`px-2 py-2 text-center text-xs font-medium whitespace-nowrap border-r ${pastEventIds.has(event.id) ? "bg-muted/70" : ""}`}>
                  <Link
                    href={`/events/${event.id}`}
                    className="hover:underline"
                    title={event.name}
                  >
                    <div>{format(new Date(event.date), dateFormat, { locale: dateLoc })}</div>
                    <div className="text-[10px] text-muted-foreground">{event.time}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          {voiceGroupOrder.map((vg) => {
            const groupMembers = grouped.get(vg) ?? [];
            if (groupMembers.length === 0) return null;

            const label = vg ? t(`members.voiceGroups.${vg}`) : t("presence.unassigned");

            return (
              <tbody key={vg ?? "unassigned"}>
                <tr>
                  <td
                    colSpan={events.length + 1}
                    className="sticky left-0 z-10 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground border-t"
                  >
                    {label}
                  </td>
                </tr>
                {groupMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-background px-3 py-1.5 border-r whitespace-nowrap">
                      <Link
                        href={`/members/${member.id}`}
                        className="flex items-center gap-2 hover:underline text-sm"
                      >
                        <AvatarDisplay
                          name={member.name}
                          imageUrl={member.profilePicture}
                          size="sm"
                        />
                        {member.name}
                      </Link>
                    </td>
                    {events.map((event) => {
                      const record = lookup.get(`${member.id}-${event.id}`);
                      const status = record?.status ?? "unset";
                      const config = statusConfig[status] ?? statusConfig.unset;
                      const Icon = config.icon;
                      const isSelf = member.id === currentMemberId;
                      const canEdit = isSelf || isDirectorOrAdmin;

                      return (
                        <td
                          key={event.id}
                          className={`px-2 py-1.5 text-center border-r ${pastEventIds.has(event.id) ? "bg-muted/30" : ""} ${canEdit ? "cursor-pointer hover:bg-muted/50" : "cursor-pointer"}`}
                          onClick={(e) => handleCellClick(e, member, event, record)}
                        >
                          <Icon className={`h-4 w-4 mx-auto ${config.colorClass}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}
