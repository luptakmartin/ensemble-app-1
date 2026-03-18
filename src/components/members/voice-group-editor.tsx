"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const voiceGroups = ["S", "A", "T", "B"] as const;

export function VoiceGroupEditor({
  memberId,
  currentVoiceGroup,
}: {
  memberId: string;
  currentVoiceGroup: string | null;
}) {
  const t = useTranslations("members");
  const tToast = useTranslations("toast");
  const [value, setValue] = useState(currentVoiceGroup);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newValue: string) => {
    const voiceGroup = newValue === "unassigned" ? null : newValue;
    const previous = value;
    setValue(voiceGroup);
    setSaving(true);

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceGroup }),
      });
      if (!res.ok) {
        setValue(previous);
        toast.error(tToast("error"));
      } else {
        toast.success(tToast("saveSuccess"));
      }
    } catch {
      setValue(previous);
      toast.error(tToast("networkError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{t("voiceGroup")}</label>
      <Select
        value={value ?? "unassigned"}
        onValueChange={handleChange}
        disabled={saving}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">—</SelectItem>
          {voiceGroups.map((group) => (
            <SelectItem key={group} value={group}>
              {t(`voiceGroups.${group}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
