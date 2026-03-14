import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionRepository, AttachmentRepository } from "@/lib/db/repositories";
import { CompositionList } from "@/components/compositions/composition-list";

export default async function CompositionsPage() {
  const session = await requireSession();
  const t = await getTranslations("compositions");

  const canEdit = hasRole(session.member.roles, ["admin", "director"]);
  const repo = new CompositionRepository(session.ensembleId);

  const compositions = canEdit
    ? await repo.findAll()
    : await repo.findLinkedToAnyEvent();

  const attachmentRepo = new AttachmentRepository();
  const attachmentCounts = await attachmentRepo.countByCompositionIds(
    compositions.map((c) => c.id)
  );

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <CompositionList
        compositions={compositions}
        canEdit={canEdit}
        attachmentCounts={attachmentCounts}
      />
    </div>
  );
}
