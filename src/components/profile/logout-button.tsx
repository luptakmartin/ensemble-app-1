"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/[locale]/(authed)/actions";

export function LogoutButton() {
  const t = useTranslations("auth");

  return (
    <form action={signOut}>
      <Button variant="outline" className="w-full" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        {t("logout")}
      </Button>
    </form>
  );
}
