"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceGroupSelect } from "@/components/members/voice-group-select";
import { memberProfileSchema, type MemberProfileInput } from "@/lib/validation/schemas";
import type { Member } from "@/lib/db/repositories";
import { toast } from "sonner";

export function ProfileForm({ member }: { member: Member }) {
  const t = useTranslations();
  const router = useRouter();

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
    },
  });

  const voiceGroup = watch("voiceGroup");

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
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>{t("profile.picture")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handlePictureUpload}
        />
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("profile.save")}
      </Button>
    </form>
  );
}
