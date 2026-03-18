import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository, AttendanceRepository, CompositionRepository, AttachmentRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { EventDetail } from "@/components/events/event-detail";
import { EventDetailClient } from "@/components/events/event-detail-client";

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

  const compositionRepo = new CompositionRepository(session.ensembleId);
  const linkedCompositions = await compositionRepo.findByEvent(event.id);
  const allCompositions = canEdit ? await compositionRepo.findAll() : [];

  const attachmentRepo = new AttachmentRepository();
  const attachmentCounts = linkedCompositions.length > 0
    ? await attachmentRepo.countByCompositionIds(linkedCompositions.map((c) => c.id))
    : {};

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("details")}</h1>
      <EventDetail event={event} canEdit={canEdit} />
      <EventDetailClient
        event={event}
        initialAttendance={attendance}
        currentMemberId={session.member.id}
        isAdmin={isAdmin}
        isDirectorOrAdmin={isDirectorOrAdmin}
        canEdit={canEdit}
        linkedCompositions={linkedCompositions}
        allCompositions={allCompositions}
        attachmentCounts={attachmentCounts}
      />
    </div>
  );
}
