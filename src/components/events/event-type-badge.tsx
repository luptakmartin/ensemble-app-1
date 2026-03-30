"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/db/repositories";

export const typeColorMap: Record<Event["type"], string> = {
  regular_rehearsal: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  exceptional_rehearsal: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  general_rehearsal: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  concert: "bg-green-100 text-green-800 hover:bg-green-100",
  meeting: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  other: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

export const calendarColorMap: Record<Event["type"], string> = {
  regular_rehearsal: "#3b82f6",
  exceptional_rehearsal: "#f97316",
  general_rehearsal: "#a855f7",
  concert: "#22c55e",
  meeting: "#6b7280",
  other: "#eab308",
};

export function EventTypeBadge({ type }: { type: Event["type"] }) {
  const t = useTranslations("events");

  return (
    <Badge className={typeColorMap[type]} variant="secondary">
      {t(`types.${type}`)}
    </Badge>
  );
}
