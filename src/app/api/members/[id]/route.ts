import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { MemberRepository } from "@/lib/db/repositories";
import { memberProfileSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const repo = new MemberRepository(session.ensembleId);
  const member = await repo.findById(id);

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isSelf = session.member.id === id;
  const isAdmin = hasRole(session.member.roles, ["admin"]);
  const isDirector = hasRole(session.member.roles, ["director"]);

  if (!isSelf && !isAdmin && !isDirector) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = memberProfileSchema.partial().parse(body);

    // Filter allowed fields by role
    let allowedData: typeof data;
    if (isAdmin) {
      allowedData = data;
    } else if (isDirector && !isSelf) {
      // Directors can only change voiceGroup of other members
      allowedData = { voiceGroup: data.voiceGroup };
    } else {
      // Members can update their own profile
      allowedData = data;
    }

    const repo = new MemberRepository(session.ensembleId);
    const member = await repo.update(id, allowedData);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (session.member.id === id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  const repo = new MemberRepository(session.ensembleId);
  await repo.delete(id);

  return NextResponse.json({ success: true });
}
