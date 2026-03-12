"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
