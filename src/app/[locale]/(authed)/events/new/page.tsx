import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { hasRole } from "@/lib/auth/roles";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage() {
  const session = await requireSession();
  const locale = await getLocale();

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    redirect(`/${locale}/events`);
  }

  const t = await getTranslations("events");

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("create")}</h1>
      <EventForm mode="create" />
    </div>
  );
}
