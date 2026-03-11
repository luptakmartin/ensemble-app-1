import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { CompositionRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { CompositionForm } from "@/components/compositions/composition-form";

export default async function EditCompositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const locale = await getLocale();

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    redirect(`/${locale}/compositions`);
  }

  const { id } = await params;
  const t = await getTranslations("compositions");

  const repo = new CompositionRepository(session.ensembleId);
  const composition = await repo.findById(id);

  if (!composition) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("edit")}</h1>
      <CompositionForm mode="edit" composition={composition} />
    </div>
  );
}
