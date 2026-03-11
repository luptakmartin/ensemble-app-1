import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository, AttendanceRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { EventDetail } from "@/components/events/event-detail";
import { AttendancePanel } from "@/components/attendance/attendance-panel";
import { Separator } from "@/components/ui/separator";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const t = await getTranslations("events");

  const repo = new EventRepository(session.ensembleId);
  const event = await repo.findById(id);

  if (!event) {
    notFound();
  }

  const canEdit = hasRole(session.member.roles, ["admin", "director"]);
  const isAdmin = hasRole(session.member.roles, ["admin"]);
  const isDirectorOrAdmin = hasRole(session.member.roles, ["admin", "director"]);

  const attendanceRepo = new AttendanceRepository(session.ensembleId);
  const attendance = await attendanceRepo.findByEvent(event.id);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("details")}</h1>
      <EventDetail event={event} canEdit={canEdit} />
      <Separator className="my-6" />
      <AttendancePanel
        event={event}
        attendance={attendance}
        currentMemberId={session.member.id}
        isAdmin={isAdmin}
        isDirectorOrAdmin={isDirectorOrAdmin}
      />
    </div>
  );
}
