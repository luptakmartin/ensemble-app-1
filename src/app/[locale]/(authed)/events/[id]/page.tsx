import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository, AttendanceRepository, CompositionRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { EventDetail } from "@/components/events/event-detail";
import { AttendancePanel } from "@/components/attendance/attendance-panel";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/i18n/routing";
import { Music } from "lucide-react";
import { EventCompositionPicker } from "@/components/compositions/event-composition-picker";

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
      <Separator className="my-6" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Music className="h-4 w-4" />
            Compositions
          </h3>
          {canEdit && (
            <EventCompositionPicker
              eventId={event.id}
              allCompositions={allCompositions}
              linkedCompositions={linkedCompositions}
            />
          )}
        </div>
        {linkedCompositions.length > 0 ? (
          <ul className="space-y-1">
            {linkedCompositions.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/compositions/${c.id}`}
                  className="text-sm hover:underline"
                >
                  {c.name} — {c.author}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
}
