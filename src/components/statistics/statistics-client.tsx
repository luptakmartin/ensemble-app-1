"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatisticsTable } from "./statistics-table";
import { exportToXlsx, exportToCsv, exportToPdf } from "./statistics-export";
import type { Event, Member, AttendanceWithMember } from "@/lib/db/repositories";

interface StatisticsData {
  events: Event[];
  members: Member[];
  attendance: AttendanceWithMember[];
}

function defaultFrom(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0];
}

export function StatisticsClient({
  currentMemberId,
  isDirectorOrAdmin,
}: {
  currentMemberId: string;
  isDirectorOrAdmin: boolean;
}) {
  const t = useTranslations("statistics");
  const tMembers = useTranslations("members");
  const tPresence = useTranslations("presence");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState("");
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const response = await fetch(`/api/statistics?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAttendanceUpdate = (
    memberId: string,
    eventId: string,
    status: string,
    note: string | null
  ) => {
    if (!data) return;
    const exists = data.attendance.some(
      (a) => a.memberId === memberId && a.eventId === eventId
    );
    const updatedAttendance = exists
      ? data.attendance.map((a) =>
          a.memberId === memberId && a.eventId === eventId
            ? { ...a, status: status as AttendanceWithMember["status"], note }
            : a
        )
      : [
          ...data.attendance,
          {
            id: "",
            memberId,
            eventId,
            status: status as AttendanceWithMember["status"],
            note,
            updatedAt: new Date(),
            memberName: data.members.find((m) => m.id === memberId)?.name ?? "",
            voiceGroup: data.members.find((m) => m.id === memberId)?.voiceGroup ?? null,
            profilePicture: data.members.find((m) => m.id === memberId)?.profilePicture ?? null,
          },
        ];
    setData({ ...data, attendance: updatedAttendance });
  };

  const handleExport = async (format: "xlsx" | "csv" | "pdf") => {
    if (!data) return;
    const exportData = {
      events: data.events,
      members: data.members,
      attendance: data.attendance,
      voiceGroupLabels: {
        S: tMembers("voiceGroups.S"),
        A: tMembers("voiceGroups.A"),
        T: tMembers("voiceGroups.T"),
        B: tMembers("voiceGroups.B"),
      },
      unassignedLabel: tPresence("unassigned"),
    };
    if (format === "xlsx") await exportToXlsx(exportData);
    else if (format === "csv") await exportToCsv(exportData);
    else await exportToPdf(exportData);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-1">
          <Label htmlFor="stats-from">{t("dateFrom")}</Label>
          <Input
            id="stats-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stats-to">{t("dateTo")}</Label>
          <Input
            id="stats-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        {data && data.events.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t("title")}...</p>
      ) : data && data.events.length > 0 ? (
        <StatisticsTable
          events={data.events}
          members={data.members}
          attendance={data.attendance}
          currentMemberId={currentMemberId}
          isDirectorOrAdmin={isDirectorOrAdmin}
          onAttendanceUpdate={handleAttendanceUpdate}
        />
      ) : (
        <p className="text-muted-foreground">{t("noData")}</p>
      )}
    </div>
  );
}
