import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionForm } from "@/components/compositions/composition-form";

export default async function NewCompositionPage() {
  const session = await requireSession();
  const locale = await getLocale();

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    redirect(`/${locale}/compositions`);
  }

  const t = await getTranslations("compositions");

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("create")}</h1>
      <CompositionForm mode="create" />
    </div>
  );
}
