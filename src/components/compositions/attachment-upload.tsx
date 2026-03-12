"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
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
  const [mode, setMode] = useState<"link" | "file">("link");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"sheet" | "audio">("sheet");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let res: Response;
      if (mode === "link") {
        res = await fetch(`/api/compositions/${compositionId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, url, type, isLink: true }),
        });
      } else {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
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
        router.refresh();
      }
    } catch {
      toast.error(tToast("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium">{t("addAttachment")}</h3>

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
            required
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
              id="att-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="att-file">{t("uploadFile")}</Label>
            <Input
              id="att-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {t("addAttachment")}
        </Button>
      </form>
    </div>
  );
}
