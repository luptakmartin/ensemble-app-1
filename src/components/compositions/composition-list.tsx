"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompositionCard } from "./composition-card";
import type { CompositionWithCount } from "./types";
import { Link } from "@/lib/i18n/routing";

export function CompositionList({
  compositions,
  canEdit,
}: {
  compositions: CompositionWithCount[];
  canEdit: boolean;
}) {
  const t = useTranslations("compositions");

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/compositions/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Link>
          </Button>
        </div>
      )}

      {compositions.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          {t("noCompositions")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compositions.map((composition) => (
            <CompositionCard
              key={composition.id}
              composition={composition}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
