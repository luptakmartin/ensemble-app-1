import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { EventRepository, AttendanceRepository } from "@/lib/db/repositories";
import { attendanceUpdateSchema } from "@/lib/validation/schemas";
import { hasEventStarted } from "@/lib/utils/event-time";

type RouteParams = { params: Promise<{ id: string }> };

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

  const attendanceRepo = new AttendanceRepository(session.ensembleId);
  const attendance = await attendanceRepo.findByEvent(id);

  return NextResponse.json(attendance);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = attendanceUpdateSchema.parse(body);

    const isAdmin = hasRole(session.member.roles, ["admin"]);
    const isDirectorOrAdmin = hasRole(session.member.roles, ["admin", "director"]);

    // Determine target member
    let targetMemberId: string;
    if (data.memberId) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetMemberId = data.memberId;
    } else {
      targetMemberId = session.member.id;
    }

    const isSelf = targetMemberId === session.member.id;

    // Check if editing others without admin
    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Time restriction for members
    const eventRepo = new EventRepository(session.ensembleId);
    const event = await eventRepo.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const eventStarted = hasEventStarted(event.date, event.time);

    if (eventStarted && isSelf && !isDirectorOrAdmin) {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 403 }
      );
    }

    // When editing another member, ignore note field (only self can set notes)
    const note = isSelf ? data.note : undefined;

    const attendanceRepo = new AttendanceRepository(session.ensembleId);
    const result = await attendanceRepo.upsert(id, targetMemberId, data.status, note);

    return NextResponse.json(result);
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
