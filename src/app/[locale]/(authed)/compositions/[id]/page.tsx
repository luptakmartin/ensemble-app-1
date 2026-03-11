import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { CompositionRepository, AttachmentRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { ArrowLeft, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/i18n/routing";
import { AttachmentList } from "@/components/compositions/attachment-list";
import { AttachmentUpload } from "@/components/compositions/attachment-upload";

export default async function CompositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const t = await getTranslations("compositions");

  const repo = new CompositionRepository(session.ensembleId);
  const composition = await repo.findById(id);

  if (!composition) {
    notFound();
  }

  const canEdit = hasRole(session.member.roles, ["admin", "director"]);

  const attachmentRepo = new AttachmentRepository();
  const attachments = await attachmentRepo.findByComposition(id);

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/compositions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToCompositions")}
        </Link>
      </Button>

      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-semibold">{composition.name}</h2>

        <div className="space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{composition.author}</span>
          </div>
          {composition.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{composition.duration}</span>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/compositions/${composition.id}/edit`}>
                {t("edit")}
              </Link>
            </Button>
          </div>
        )}

        <Separator />

        <AttachmentList
          attachments={attachments}
          compositionId={composition.id}
          canEdit={canEdit}
        />

        {canEdit && (
          <>
            <Separator />
            <AttachmentUpload compositionId={composition.id} />
          </>
        )}
      </div>
    </div>
  );
}
