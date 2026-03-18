"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceGroupSelect } from "@/components/members/voice-group-select";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { memberProfileSchema, type MemberProfileInput } from "@/lib/validation/schemas";
import type { Member } from "@/lib/db/repositories";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function AdminMemberEditor({ member }: { member: Member }) {
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
      const response = await fetch(`/api/members/${member.id}`, {
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

    try {
      const response = await fetch(`/api/members/${member.id}/picture`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast.success(t("toast.profileUpdated"));
        router.refresh();
      } else {
        toast.error(t("toast.error"));
      }
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  const handlePictureDelete = async () => {
    try {
      const response = await fetch(`/api/members/${member.id}/picture`, {
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("members.editMember")}</h3>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-member-name">{t("profile.name")}</Label>
          <Input id="admin-member-name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-member-email">{t("profile.email")}</Label>
          <Input id="admin-member-email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-member-phone">{t("profile.phone")}</Label>
          <Input id="admin-member-phone" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label>{t("members.voiceGroup")}</Label>
          <VoiceGroupSelect
            value={voiceGroup}
            onChange={(v) => setValue("voiceGroup", v as MemberProfileInput["voiceGroup"])}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}
