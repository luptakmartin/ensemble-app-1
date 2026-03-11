import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionRepository } from "@/lib/db/repositories";
import { compositionSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const repo = new CompositionRepository(session.ensembleId);
  const composition = await repo.findById(id);

  if (!composition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Members can only see compositions linked to events
  if (!hasRole(session.member.roles, ["admin", "director"])) {
    const linked = await repo.findLinkedToAnyEvent();
    if (!linked.some((c) => c.id === id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json(composition);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = compositionSchema.partial().parse(body);
    const repo = new CompositionRepository(session.ensembleId);
    const composition = await repo.update(id, data);
    return NextResponse.json(composition);
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

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const repo = new CompositionRepository(session.ensembleId);
  await repo.delete(id);

  return NextResponse.json({ success: true });
}
