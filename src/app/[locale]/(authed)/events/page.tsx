import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository } from "@/lib/db/repositories";
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

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <EventList
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        allEvents={[...upcomingEvents, ...pastEvents]}
        canEdit={canEdit}
      />
    </div>
  );
}
