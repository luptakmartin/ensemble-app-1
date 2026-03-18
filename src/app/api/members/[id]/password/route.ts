import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { MemberRepository } from "@/lib/db/repositories";
import { getAuthService } from "@/lib/services/auth";
import { setPasswordSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const repo = new MemberRepository(session.ensembleId);
  const member = await repo.findById(id);

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!member.userId) {
    return NextResponse.json({ error: "Member has no user account" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { newPassword } = setPasswordSchema.parse(body);

    const authService = getAuthService();
    await authService.setUserPassword(member.userId, newPassword);

    return NextResponse.json({ success: true });
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
