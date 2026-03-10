import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("profile");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {/* Profile form will be implemented here */}
    </div>
  );
}
