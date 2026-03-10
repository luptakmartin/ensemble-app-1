import { useTranslations } from "next-intl";

export default function EventsPage() {
  const t = useTranslations("events");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {/* Events list (card/calendar view) will be implemented here */}
    </div>
  );
}
