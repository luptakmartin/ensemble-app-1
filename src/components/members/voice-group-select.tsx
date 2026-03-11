"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const voiceGroups = ["S", "A", "T", "B"] as const;

export function VoiceGroupSelect({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  const t = useTranslations("members");

  return (
    <Select
      value={value ?? "unassigned"}
      onValueChange={(v) => onChange(v === "unassigned" ? null : v)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">{t("allGroups")}</SelectItem>
        {voiceGroups.map((group) => (
          <SelectItem key={group} value={group}>
            {t(`voiceGroups.${group}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
