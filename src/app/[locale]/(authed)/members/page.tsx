import { useTranslations } from "next-intl";

export default function MembersPage() {
  const t = useTranslations("members");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {/* Members list will be implemented here */}
    </div>
  );
}
