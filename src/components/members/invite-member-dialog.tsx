"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { memberInviteSchema, type MemberInviteInput } from "@/lib/validation/schemas";
import { toast } from "sonner";

const roles = ["admin", "director", "member"] as const;

export function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberInviteInput>({
    resolver: zodResolver(memberInviteSchema),
    defaultValues: { role: "member" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: MemberInviteInput) => {
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t("toast.error"));
        return;
      }

      const result = await response.json();
      setTempPassword(result.temporaryPassword);
      toast.success(t("toast.inviteSent"));
      router.refresh();
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTempPassword(null);
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("members.invite")}</DialogTitle>
          <DialogDescription>
            {t("members.inviteDescription")}
          </DialogDescription>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("members.temporaryPassword")}</Label>
              <Input value={tempPassword} readOnly />
              <p className="text-sm text-muted-foreground">
                {t("members.temporaryPasswordNote")}
              </p>
            </div>
            <Button onClick={() => handleClose(false)}>
              {t("common.confirm")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">{t("profile.name")}</Label>
              <Input id="invite-name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email">{t("profile.email")}</Label>
              <Input id="invite-email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">{t("members.role")}</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as MemberInviteInput["role"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`members.roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.loading") : t("members.invite")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
