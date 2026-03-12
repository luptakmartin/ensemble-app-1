"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { FileMusic, Headphones, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attachment } from "@/lib/db/repositories";
import { toast } from "sonner";

export function AttachmentList({
  attachments,
  compositionId,
  canEdit,
}: {
  attachments: Attachment[];
  compositionId: string;
  canEdit: boolean;
}) {
  const t = useTranslations("compositions");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sheets = attachments.filter((a) => a.type === "sheet");
  const audio = attachments.filter((a) => a.type === "audio");

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    try {
      const res = await fetch(
        `/api/compositions/${compositionId}/attachments/${attachmentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || tToast("error"));
      } else {
        toast.success(tToast("attachmentDeleted"));
        router.refresh();
      }
    } catch {
      toast.error(tToast("networkError"));
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = (attachment: Attachment) => {
    const Icon = attachment.type === "sheet" ? FileMusic : Headphones;
    return (
      <div
        key={attachment.id}
        className="flex items-center justify-between gap-2 py-1"
      >
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm hover:underline"
        >
          <Icon className="h-4 w-4" />
          <span>{attachment.name}</span>
          {attachment.isLink && <ExternalLink className="h-3 w-3" />}
        </a>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleDelete(attachment.id)}
            disabled={deletingId === attachment.id}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  };

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t("attachments")}</h3>

      {sheets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            {t("sheets")}
          </h4>
          <div className="space-y-1">{sheets.map(renderItem)}</div>
        </div>
      )}

      {audio.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            {t("audio")}
          </h4>
          <div className="space-y-1">{audio.map(renderItem)}</div>
        </div>
      )}
    </div>
  );
}
