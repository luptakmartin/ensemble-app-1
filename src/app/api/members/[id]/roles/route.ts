import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { MemberRepository } from "@/lib/db/repositories";
import { memberRolesSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = memberRolesSchema.parse(body);

    // Prevent removing own admin role
    if (
      session.member.id === id &&
      !data.roles.includes("admin")
    ) {
      return NextResponse.json(
        { error: "Cannot remove your own admin role" },
        { status: 400 }
      );
    }

    const repo = new MemberRepository(session.ensembleId);
    await repo.setRoles(id, data.roles);
    const member = await repo.findById(id);

    return NextResponse.json(member);
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
