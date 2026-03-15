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

  // Merge attachment counts into plain serializable objects for RSC boundary
  const compositionsWithCounts = compositions.map((c) => ({
    id: c.id,
    ensembleId: c.ensembleId,
    name: c.name,
    author: c.author,
    duration: c.duration,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    attachmentCount: attachmentCounts[c.id] ?? 0,
  }));

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <CompositionList
        compositions={compositionsWithCounts}
        canEdit={canEdit}
      />
    </div>
  );
}
