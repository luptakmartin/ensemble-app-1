import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { members, memberRoles } from "@/lib/db/schema";
import { getAuthService } from "@/lib/services/auth";
import type { AuthUser } from "@/lib/services/auth";
import type { Member } from "@/lib/db/repositories";

export interface SessionContext {
  user: AuthUser;
  member: Member;
  ensembleId: string;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const authService = getAuthService();
  const session = await authService.getSession();

  if (!session) {
    return null;
  }

  // Direct query to find member by userId (avoids chicken-and-egg with ensembleId)
  const memberRows = await db
    .select()
    .from(members)
    .leftJoin(memberRoles, eq(memberRoles.memberId, members.id))
    .where(eq(members.userId, session.user.id))
    .limit(10);

  if (memberRows.length === 0) {
    return null;
  }

  // Aggregate roles for the first member found
  const firstMember = memberRows[0].members;
  const roles = memberRows
    .filter((row) => row.member_roles !== null)
    .map((row) => row.member_roles!.role);

  const member: Member = {
    ...firstMember,
    roles,
  };

  return {
    user: session.user,
    member,
    ensembleId: firstMember.ensembleId,
  };
}
