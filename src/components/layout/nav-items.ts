import type { UserRole } from "@/lib/db/repositories";

export interface NavItem {
  href: string;
  labelKey: string;
  iconName: "calendar" | "music" | "users" | "user";
  requiredRoles?: UserRole[];
}

export const navItems: NavItem[] = [
  {
    href: "/events",
    labelKey: "events.title",
    iconName: "calendar",
  },
  {
    href: "/compositions",
    labelKey: "compositions.title",
    iconName: "music",
  },
  {
    href: "/members",
    labelKey: "members.title",
    iconName: "users",
    requiredRoles: ["admin", "director"],
  },
  {
    href: "/profile",
    labelKey: "profile.title",
    iconName: "user",
  },
];

export function getVisibleNavItems(roles: UserRole[]): NavItem[] {
  return navItems.filter((item) => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => roles.includes(role));
  });
}
