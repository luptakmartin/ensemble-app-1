"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(changePasswordFormSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t("toast.error"));
        return;
      }

      toast.success(t("toast.passwordChanged"));
      reset();
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">{t("profile.changePassword")}</h2>

      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {t("profile.passwordMismatch")}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : t("profile.changePassword")}
      </Button>
    </form>
  );
}
