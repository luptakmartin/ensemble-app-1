import { requireSession } from "@/lib/auth/require-session";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { StatisticsClient } from "@/components/statistics/statistics-client";

export default async function StatisticsPage() {
  const session = await requireSession();

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    const locale = await getLocale();
    redirect(`/${locale}/events`);
  }

  const isDirectorOrAdmin = hasRole(session.member.roles, ["admin", "director"]);

  return (
    <StatisticsClient
      currentMemberId={session.member.id}
      isDirectorOrAdmin={isDirectorOrAdmin}
    />
  );
}
