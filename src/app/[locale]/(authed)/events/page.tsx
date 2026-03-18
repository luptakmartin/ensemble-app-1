import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository, AttendanceRepository, CompositionRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { EventList } from "@/components/events/event-list";

export default async function EventsPage() {
  const session = await requireSession();
  const t = await getTranslations("events");

  const repo = new EventRepository(session.ensembleId);
  const [upcomingEvents, pastEvents] = await Promise.all([
    repo.findUpcoming(),
    repo.findPast(),
  ]);

  const canEdit = hasRole(session.member.roles, ["admin", "director"]);

  const allEvents = [...upcomingEvents, ...pastEvents];
  const allEventIds = allEvents.map((e) => e.id);

  const attendanceRepo = new AttendanceRepository(session.ensembleId);
  const compositionRepo = new CompositionRepository(session.ensembleId);

  const [userAttendance, compositionCountMap] = await Promise.all([
    attendanceRepo.findByMemberForEvents(session.member.id, allEventIds),
    compositionRepo.countByEventIds(allEventIds),
  ]);

  const userAttendanceMap: Record<string, { status: "yes" | "maybe" | "no" | "unset"; note: string | null }> = {};
  for (const a of userAttendance) {
    userAttendanceMap[a.eventId] = { status: a.status, note: a.note };
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <EventList
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        allEvents={allEvents}
        canEdit={canEdit}
        userAttendanceMap={userAttendanceMap}
        currentMemberId={session.member.id}
        compositionCountMap={compositionCountMap}
      />
    </div>
  );
}
