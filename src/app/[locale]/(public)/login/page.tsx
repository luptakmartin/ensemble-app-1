import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-center text-2xl font-bold">Ensemble</h1>
        <p className="text-center text-muted-foreground">{t("login")}</p>
        {/* Login form will be implemented here */}
      </div>
    </main>
  );
}
