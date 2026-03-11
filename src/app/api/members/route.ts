import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { MemberRepository } from "@/lib/db/repositories";
import { getAuthService } from "@/lib/services/auth";
import { memberInviteSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = new MemberRepository(session.ensembleId);
  const members = await repo.findAll();

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = memberInviteSchema.parse(body);

    const tempPassword = "password123";
    const authService = getAuthService();
    const authUser = await authService.inviteUser(data.email, tempPassword);

    const repo = new MemberRepository(session.ensembleId);
    const member = await repo.create({
      userId: authUser.id,
      name: data.name,
      email: data.email,
    });
    await repo.addRole(member.id, data.role);

    return NextResponse.json(
      { ...member, roles: [data.role], temporaryPassword: tempPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
