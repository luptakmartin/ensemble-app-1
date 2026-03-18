"use client";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

const palette = [
  "bg-red-200 text-red-800",
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-purple-200 text-purple-800",
  "bg-amber-200 text-amber-800",
  "bg-teal-200 text-teal-800",
  "bg-pink-200 text-pink-800",
  "bg-indigo-200 text-indigo-800",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function AvatarDisplay({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = sizeClasses[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("rounded-full object-cover aspect-square", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium select-none",
        sizeClass,
        getColorFromName(name)
      )}
    >
      {getInitials(name)}
    </div>
  );
}
