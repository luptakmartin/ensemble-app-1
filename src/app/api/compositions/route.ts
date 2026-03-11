import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionRepository } from "@/lib/db/repositories";
import { compositionSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = new CompositionRepository(session.ensembleId);

  const compositions = hasRole(session.member.roles, ["admin", "director"])
    ? await repo.findAll()
    : await repo.findLinkedToAnyEvent();

  return NextResponse.json(compositions);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = compositionSchema.parse(body);
    const repo = new CompositionRepository(session.ensembleId);
    const composition = await repo.create(data);

    return NextResponse.json(composition, { status: 201 });
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
