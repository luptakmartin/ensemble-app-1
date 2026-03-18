"use client";

import { useTranslations } from "next-intl";
import { Check, HelpCircle, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

const statusConfig = [
  { status: "yes" as const, Icon: Check, activeClass: "bg-green-600 text-white hover:bg-green-700" },
  { status: "maybe" as const, Icon: HelpCircle, activeClass: "bg-blue-600 text-white hover:bg-blue-700" },
  { status: "no" as const, Icon: X, activeClass: "bg-red-600 text-white hover:bg-red-700" },
  { status: "unset" as const, Icon: Minus, activeClass: "bg-gray-500 text-white hover:bg-gray-600" },
];

export function PresenceButton({
  status,
  onStatusChange,
  disabled,
  compact,
}: {
  status: PresenceStatus;
  onStatusChange: (status: PresenceStatus) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("presence");

  return (
    <div className="flex flex-wrap gap-1">
      {statusConfig.map(({ status: s, Icon, activeClass }) => (
        <Button
          key={s}
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label={t(s)}
          className={cn(
            compact ? "h-8 w-8 p-0" : "h-8 px-3",
            status === s && activeClass
          )}
          onClick={() => onStatusChange(s)}
        >
          <Icon className={cn("h-4 w-4", !compact && "mr-1")} />
          {!compact && t(s)}
        </Button>
      ))}
    </div>
  );
}
