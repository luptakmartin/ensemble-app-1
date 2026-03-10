import type { UserRole } from "@/lib/db/repositories";

export function hasRole(roles: UserRole[], required: UserRole[]): boolean {
  return required.some((r) => roles.includes(r));
}
