"use client";

import { useTranslations } from "next-intl";
import { PresenceButton } from "./presence-button";
import { Badge } from "@/components/ui/badge";
import type { AttendanceWithMember } from "@/lib/db/repositories";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

const statusBadgeVariant: Record<string, string> = {
  yes: "bg-green-100 text-green-800",
  maybe: "bg-blue-100 text-blue-800",
  no: "bg-red-100 text-red-800",
  unset: "bg-gray-100 text-gray-800",
};

const voiceGroupOrder = ["S", "A", "T", "B", null] as const;

export function AttendanceDetail({
  attendance,
  currentMemberId,
  canEditOthers,
  eventStarted,
  isDirectorOrAdmin,
  onStatusChange,
}: {
  attendance: AttendanceWithMember[];
  currentMemberId: string;
  canEditOthers: boolean;
  eventStarted: boolean;
  isDirectorOrAdmin: boolean;
  onStatusChange: (memberId: string, status: PresenceStatus) => void;
}) {
  const t = useTranslations("presence");

  const grouped = new Map<string | null, AttendanceWithMember[]>();
  for (const vg of voiceGroupOrder) {
    grouped.set(vg === null ? null : vg, []);
  }
  for (const a of attendance) {
    const key = a.voiceGroup;
    const list = grouped.get(key);
    if (list) {
      list.push(a);
    } else {
      grouped.get(null)!.push(a);
    }
  }

  return (
    <div className="space-y-4">
      {voiceGroupOrder.map((vg) => {
        const members = grouped.get(vg === null ? null : vg) ?? [];
        if (members.length === 0) return null;

        const label = vg ?? t("unassigned");

        return (
          <div key={vg ?? "unassigned"}>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              {label}
            </h4>
            <div className="space-y-1">
              {members.map((a) => {
                const isSelf = a.memberId === currentMemberId;
                const canEdit = isSelf
                  ? !eventStarted || isDirectorOrAdmin
                  : canEditOthers;

                return (
                  <div
                    key={a.memberId}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={isSelf ? "font-semibold" : ""}>
                          {a.memberName}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusBadgeVariant[a.status]}
                        >
                          {t(a.status)}
                        </Badge>
                      </div>
                      {a.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.note}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <PresenceButton
                        status={a.status}
                        onStatusChange={(s) => onStatusChange(a.memberId, s)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
