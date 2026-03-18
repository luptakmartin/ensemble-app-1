import { format } from "date-fns";
import type { Event, Member, AttendanceWithMember } from "@/lib/db/repositories";

const voiceGroupOrder = ["S", "A", "T", "B", null] as const;

const statusLabels: Record<string, string> = {
  yes: "✓",
  maybe: "?",
  no: "✗",
  unset: "—",
};

interface ExportData {
  events: Event[];
  members: Member[];
  attendance: AttendanceWithMember[];
  voiceGroupLabels: Record<string, string>;
  unassignedLabel: string;
}

function buildExportRows(data: ExportData) {
  const { events, members, attendance, voiceGroupLabels, unassignedLabel } = data;

  const lookup = new Map<string, string>();
  for (const a of attendance) {
    lookup.set(`${a.memberId}-${a.eventId}`, a.status);
  }

  const grouped = new Map<string | null, Member[]>();
  for (const vg of voiceGroupOrder) {
    grouped.set(vg, []);
  }
  for (const member of members) {
    const list = grouped.get(member.voiceGroup);
    if (list) {
      list.push(member);
    } else {
      grouped.get(null)!.push(member);
    }
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const headers = ["", ...events.map((e) => {
    const dateStr = format(new Date(e.date), "d.M.yy");
    return `${dateStr} ${e.time}`;
  })];

  const rows: string[][] = [];
  for (const vg of voiceGroupOrder) {
    const groupMembers = grouped.get(vg) ?? [];
    if (groupMembers.length === 0) continue;

    const label = vg ? (voiceGroupLabels[vg] ?? vg) : unassignedLabel;
    rows.push([label, ...events.map(() => "")]);

    for (const member of groupMembers) {
      rows.push([
        member.name,
        ...events.map((event) => {
          const status = lookup.get(`${member.id}-${event.id}`) ?? "unset";
          return statusLabels[status] ?? "—";
        }),
      ]);
    }
  }

  return { headers, rows };
}

export async function exportToXlsx(data: ExportData) {
  const XLSX = await import("xlsx");
  const { headers, rows } = buildExportRows(data);

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [{ wch: 25 }, ...data.events.map(() => ({ wch: 12 }))];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Statistics");
  XLSX.writeFile(wb, "statistics.xlsx");
}

export async function exportToCsv(data: ExportData) {
  const XLSX = await import("xlsx");
  const { headers, rows } = buildExportRows(data);

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "statistics.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPdf(data: ExportData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const { headers, rows } = buildExportRows(data);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 10,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [100, 100, 100], fontSize: 6 },
    columnStyles: { 0: { cellWidth: 35 } },
    theme: "grid",
  });

  doc.save("statistics.pdf");
}
