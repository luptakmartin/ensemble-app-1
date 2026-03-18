"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SetPasswordForm({ memberId }: { memberId: string }) {
  const t = useTranslations();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/members/${memberId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t("toast.error"));
        return;
      }

      toast.success(t("toast.passwordChanged"));
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("toast.networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("members.setPassword")}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="set-new-password">{t("profile.newPassword")}</Label>
          <Input
            id="set-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="set-confirm-password">{t("profile.confirmPassword")}</Label>
          <Input
            id="set-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}
