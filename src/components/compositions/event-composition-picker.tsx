"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Composition } from "@/lib/db/repositories";
import { toast } from "sonner";

export function EventCompositionPicker({
  eventId,
  allCompositions,
  linkedCompositions,
}: {
  eventId: string;
  allCompositions: Composition[];
  linkedCompositions: Composition[];
}) {
  const t = useTranslations("compositions");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const [linkedIds, setLinkedIds] = useState<Set<string>>(
    new Set(linkedCompositions.map((c) => c.id))
  );
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (compositionId: string, isLinked: boolean) => {
    setLoading(compositionId);
    try {
      if (isLinked) {
        const res = await fetch(`/api/events/${eventId}/compositions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compositionId }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || tToast("error"));
        } else {
          setLinkedIds((prev) => {
            const next = new Set(prev);
            next.delete(compositionId);
            return next;
          });
          toast.success(tToast("compositionUnlinked"));
          router.refresh();
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/compositions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compositionId }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || tToast("error"));
        } else {
          setLinkedIds((prev) => new Set(prev).add(compositionId));
          toast.success(tToast("compositionLinked"));
          router.refresh();
        }
      }
    } catch {
      toast.error(tToast("networkError"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Music className="mr-2 h-4 w-4" />
          {t("selectCompositions")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("selectCompositions")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {allCompositions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noCompositions")}</p>
          ) : (
            allCompositions.map((composition) => {
              const isLinked = linkedIds.has(composition.id);
              return (
                <label
                  key={composition.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={isLinked}
                    disabled={loading === composition.id}
                    onCheckedChange={() =>
                      handleToggle(composition.id, isLinked)
                    }
                  />
                  <div>
                    <p className="text-sm font-medium">{composition.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {composition.author}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
