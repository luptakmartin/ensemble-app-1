import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { EventRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { EventForm } from "@/components/events/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const locale = await getLocale();

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    redirect(`/${locale}/events`);
  }

  const { id } = await params;
  const t = await getTranslations("events");

  const repo = new EventRepository(session.ensembleId);
  const event = await repo.findById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("edit")}</h1>
      <EventForm mode="edit" event={event} />
    </div>
  );
}
