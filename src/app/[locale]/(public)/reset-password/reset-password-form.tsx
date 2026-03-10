"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { resetPasswordAction } from "../login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/lib/i18n/routing";

const resetSchema = z.object({
  email: z.string().email(),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const t = useTranslations();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    await resetPasswordAction(data.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {t("auth.resetPassword")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.resetPasswordSuccess")}
          </p>
          <div className="text-center">
            <Link href="/login" className="text-sm hover:underline">
              {t("auth.backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">
          {t("auth.resetPassword")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("auth.resetPasswordDescription")}
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("auth.sendResetLink")}
          </Button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:underline"
            >
              {t("auth.backToLogin")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
