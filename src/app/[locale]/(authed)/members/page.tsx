import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { MemberRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { MemberList } from "@/components/members/member-list";

export default async function MembersPage() {
  const session = await requireSession();
  const t = await getTranslations("members");

  const repo = new MemberRepository(session.ensembleId);
  const members = await repo.findAll();

  const isAdmin = hasRole(session.member.roles, ["admin"]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <MemberList members={members} isAdmin={isAdmin} />
    </div>
  );
}
