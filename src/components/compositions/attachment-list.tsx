"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { FileText, Headphones, ExternalLink, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"sheet" | "audio">("sheet");

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

  const startEdit = (attachment: Attachment) => {
    setEditingId(attachment.id);
    setEditName(attachment.name);
    setEditType(attachment.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditType("sheet");
  };

  const handleSave = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const res = await fetch(
        `/api/compositions/${compositionId}/attachments/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editName, type: editType }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || tToast("error"));
      } else {
        toast.success(tToast("attachmentUpdated"));
        cancelEdit();
        router.refresh();
      }
    } catch {
      toast.error(tToast("networkError"));
    }
  };

  const renderItem = (attachment: Attachment) => {
    const Icon = attachment.type === "sheet" ? FileText : Headphones;

    if (editingId === attachment.id) {
      return (
        <div
          key={attachment.id}
          className="flex items-center gap-2 py-1"
        >
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-8 max-w-[200px]"
            data-testid="edit-name-input"
          />
          <Select value={editType} onValueChange={(v) => setEditType(v as "sheet" | "audio")}>
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sheet">{t("sheets")}</SelectItem>
              <SelectItem value="audio">{t("audio")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
            data-testid="save-edit-button"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={cancelEdit}
            data-testid="cancel-edit-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => startEdit(attachment)}
              data-testid="edit-attachment-button"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDelete(attachment.id)}
              disabled={deletingId === attachment.id}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
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
