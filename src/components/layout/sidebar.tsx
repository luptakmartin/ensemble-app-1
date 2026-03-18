"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/routing";
import { Calendar, Music, Users, User, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVisibleNavItems } from "./nav-items";
import type { UserRole } from "@/lib/db/repositories";

const iconMap = {
  calendar: Calendar,
  music: Music,
  users: Users,
  user: User,
  "bar-chart-3": BarChart3,
} as const;

interface SidebarProps {
  roles: UserRole[];
  signOutAction: () => Promise<void>;
}

export function Sidebar({ roles, signOutAction }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const items = getVisibleNavItems(roles);

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
      <div className="flex h-14 items-center px-4 border-b">
        <span className="text-lg font-semibold">{t("common.appName")}</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = iconMap[item.iconName];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <form action={signOutAction}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            type="submit"
          >
            <LogOut className="size-4" />
            {t("auth.logout")}
          </Button>
        </form>
      </div>
    </aside>
  );
}
