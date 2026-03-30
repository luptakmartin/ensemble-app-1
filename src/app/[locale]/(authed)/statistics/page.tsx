import { requireSession } from "@/lib/auth/require-session";
import { hasRole } from "@/lib/auth/roles";
import { StatisticsClient } from "@/components/statistics/statistics-client";

export default async function StatisticsPage() {
  const session = await requireSession();

  const isDirectorOrAdmin = hasRole(session.member.roles, ["admin", "director"]);

  return (
    <StatisticsClient
      currentMemberId={session.member.id}
      isDirectorOrAdmin={isDirectorOrAdmin}
    />
  );
}
