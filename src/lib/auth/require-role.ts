import type { Member, UserRole } from "@/lib/db/repositories";

export function hasRole(member: Member, role: UserRole): boolean {
  return member.roles.includes(role);
}

export function requireRole(member: Member, ...roles: UserRole[]): void {
  const hasAny = roles.some((role) => member.roles.includes(role));
  if (!hasAny) {
    throw new Error(
      `Insufficient permissions. Required roles: ${roles.join(", ")}`
    );
  }
}
