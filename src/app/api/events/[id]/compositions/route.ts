import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { EventRepository, CompositionRepository } from "@/lib/db/repositories";

type RouteParams = { params: Promise<{ id: string }> };

const linkSchema = z.object({
  compositionId: z.string().uuid(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventRepo = new EventRepository(session.ensembleId);
  const event = await eventRepo.findById(id);

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const compositionRepo = new CompositionRepository(session.ensembleId);
  const compositions = await compositionRepo.findByEvent(id);

  return NextResponse.json(compositions);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { compositionId } = linkSchema.parse(body);

    const eventRepo = new EventRepository(session.ensembleId);
    const event = await eventRepo.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const compositionRepo = new CompositionRepository(session.ensembleId);
    const composition = await compositionRepo.findById(compositionId);
    if (!composition) {
      return NextResponse.json({ error: "Composition not found" }, { status: 404 });
    }

    await compositionRepo.linkToEvent(compositionId, id);

    return NextResponse.json({ success: true }, { status: 201 });
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

  try {
    const { id } = await params;
    const body = await request.json();
    const { compositionId } = linkSchema.parse(body);

    const compositionRepo = new CompositionRepository(session.ensembleId);
    await compositionRepo.unlinkFromEvent(compositionId, id);

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
