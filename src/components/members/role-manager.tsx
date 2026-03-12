"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/db/repositories";
import { toast } from "sonner";

const allRoles: UserRole[] = ["admin", "director", "member"];

export function RoleManager({
  memberId,
  currentRoles,
  isSelf,
}: {
  memberId: string;
  currentRoles: UserRole[];
  isSelf: boolean;
}) {
  const t = useTranslations("members");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const [roles, setRoles] = useState<UserRole[]>(currentRoles);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (role: UserRole) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/members/${memberId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || tToast("error"));
        return;
      }

      toast.success(tToast("saveSuccess"));
      router.refresh();
    } catch {
      toast.error(tToast("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t("manageRoles")}</h3>
      <div className="space-y-2">
        {allRoles.map((role) => {
          const isDisabled = isSelf && role === "admin";
          return (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role}`}
                checked={roles.includes(role)}
                onCheckedChange={() => toggleRole(role)}
                disabled={isDisabled}
              />
              <Label htmlFor={`role-${role}`}>
                {t(`roles.${role}`)}
                {isDisabled && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({t("cannotRemoveOwnAdmin")})
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={isSubmitting || roles.length === 0}
        size="sm"
      >
        {t("manageRoles")}
      </Button>
    </div>
  );
}
