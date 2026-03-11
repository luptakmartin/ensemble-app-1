"use client";

import { useTranslations } from "next-intl";

const statusColors: Record<string, string> = {
  yes: "bg-green-600",
  maybe: "bg-blue-600",
  no: "bg-red-600",
  unset: "bg-gray-400",
};

export function AttendanceSummary({
  counts,
  total,
}: {
  counts: { yes: number; maybe: number; no: number; unset: number };
  total: number;
}) {
  const t = useTranslations("presence");

  const statuses = ["yes", "maybe", "no", "unset"] as const;

  return (
    <div className="space-y-2">
      {total > 0 && (
        <div className="flex h-4 w-full overflow-hidden rounded-full">
          {statuses.map((s) =>
            counts[s] > 0 ? (
              <div
                key={s}
                className={`${statusColors[s]} transition-all`}
                style={{ width: `${(counts[s] / total) * 100}%` }}
              />
            ) : null
          )}
        </div>
      )}
      <div className="flex gap-4 text-sm">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${statusColors[s]}`} />
            <span>
              {t(s)}: {counts[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
