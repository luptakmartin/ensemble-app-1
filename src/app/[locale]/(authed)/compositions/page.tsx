import { useTranslations } from "next-intl";

export default function CompositionsPage() {
  const t = useTranslations("compositions");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {/* Compositions list will be implemented here */}
    </div>
  );
}
