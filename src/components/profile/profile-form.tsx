"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
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
import { VoiceGroupSelect } from "@/components/members/voice-group-select";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { memberProfileSchema, type MemberProfileInput } from "@/lib/validation/schemas";
import type { Member } from "@/lib/db/repositories";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const localeOptions = [
  { value: "cs", label: "Čeština" },
  { value: "sk", label: "Slovenčina" },
  { value: "en", label: "English" },
] as const;

export function ProfileForm({ member }: { member: Member }) {
  const t = useTranslations();
  const router = useRouter();
  const currentLocale = useLocale();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberProfileInput>({
    resolver: zodResolver(memberProfileSchema),
    defaultValues: {
      name: member.name,
      email: member.email,
      phone: member.phone ?? "",
      voiceGroup: member.voiceGroup,
      preferredLocale: (member.preferredLocale as MemberProfileInput["preferredLocale"]) ?? "cs",
    },
  });

  const voiceGroup = watch("voiceGroup");
  const preferredLocale = watch("preferredLocale");

  const onSubmit = async (data: MemberProfileInput) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t("toast.error"));
        return;
      }

      // If locale changed, set cookie and do full page reload to new locale
      if (data.preferredLocale && data.preferredLocale !== currentLocale) {
        document.cookie = `NEXT_LOCALE=${data.preferredLocale};path=/;max-age=31536000`;
        const newPath = window.location.pathname.replace(
          `/${currentLocale}/`,
          `/${data.preferredLocale}/`
        );
        window.location.href = newPath;
        return;
      }

      toast.success(t("toast.profileUpdated"));
      router.refresh();
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/profile/picture", {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      toast.success(t("toast.profileUpdated"));
      router.refresh();
    } else {
      toast.error(t("toast.error"));
    }
  };

  const handlePictureDelete = async () => {
    try {
      const response = await fetch("/api/profile/picture", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("toast.deleteSuccess"));
        router.refresh();
      } else {
        toast.error(t("toast.error"));
      }
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>{t("profile.picture")}</Label>
        <div className="flex items-center gap-4">
          <AvatarDisplay
            name={member.name}
            imageUrl={member.profilePicture}
            size="lg"
          />
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
            />
            {member.profilePicture && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePictureDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("common.delete")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-name">{t("profile.name")}</Label>
        <Input id="profile-name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-email">{t("profile.email")}</Label>
        <Input id="profile-email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">{t("profile.phone")}</Label>
        <Input id="profile-phone" {...register("phone")} />
      </div>

      <div className="space-y-2">
        <Label>{t("members.voiceGroup")}</Label>
        <VoiceGroupSelect
          value={voiceGroup}
          onChange={(v) => setValue("voiceGroup", v as MemberProfileInput["voiceGroup"])}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("profile.language")}</Label>
        <Select
          value={preferredLocale ?? "cs"}
          onValueChange={(v) => setValue("preferredLocale", v as MemberProfileInput["preferredLocale"])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {localeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("profile.save")}
      </Button>
    </form>
  );
}
