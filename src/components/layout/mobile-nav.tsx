"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/routing";
import { Calendar, Music, Users, User } from "lucide-react";
import { getVisibleNavItems } from "./nav-items";
import type { UserRole } from "@/lib/db/repositories";

const iconMap = {
  calendar: Calendar,
  music: Music,
  users: Users,
  user: User,
} as const;

interface MobileNavProps {
  roles: UserRole[];
}

export function MobileNav({ roles }: MobileNavProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = getVisibleNavItems(roles);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = iconMap[item.iconName];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
