"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? compositions.filter((c) => {
        const q = filter.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.author.toLowerCase().includes(q);
      })
    : compositions;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("filterPlaceholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/compositions/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Link>
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          {filter ? tCommon("noResults") : t("noCompositions")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((composition) => (
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
