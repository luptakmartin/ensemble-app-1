"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function AttachmentUpload({
  compositionId,
}: {
  compositionId: string;
}) {
  const t = useTranslations("compositions");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"link" | "file">("link");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"sheet" | "audio">("sheet");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let res: Response;
      const resolvedName = name.trim() || undefined;
      if (mode === "link") {
        res = await fetch(`/api/compositions/${compositionId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: resolvedName, url, type, isLink: true }),
        });
      } else {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        if (resolvedName) formData.append("name", resolvedName);
        formData.append("type", type);

        res = await fetch(`/api/compositions/${compositionId}/attachments`, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || tToast("error"));
      } else {
        toast.success(tToast("attachmentAdded"));
        setName("");
        setUrl("");
        setFile(null);
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      toast.error(tToast("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) {
        setName(droppedFile.name);
      }
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        data-testid="open-attachment-upload"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("addAttachment")}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{t("addAttachment")}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsOpen(false)}
          data-testid="close-attachment-upload"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "link" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("link")}
        >
          {t("linkUrl")}
        </Button>
        <Button
          type="button"
          variant={mode === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("file")}
        >
          {t("uploadFile")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="att-name">{t("name")}</Label>
          <Input
            id="att-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === "link" ? url || "" : file?.name || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="att-type">{t("sheets")}/{t("audio")}</Label>
          <Select value={type} onValueChange={(v) => setType(v as "sheet" | "audio")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sheet">{t("sheets")}</SelectItem>
              <SelectItem value="audio">{t("audio")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "link" ? (
          <div className="space-y-2">
            <Label htmlFor="att-url">URL</Label>
            <Input
              key="url"
              id="att-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>{t("uploadFile")}</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              data-testid="drop-zone"
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {file ? (
                <p className="text-sm">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("dropFilesHere")}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  setFile(selected);
                  if (selected && !name) {
                    setName(selected.name);
                  }
                }}
                data-testid="file-input"
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {t("addAttachment")}
        </Button>
      </form>
    </div>
  );
}
