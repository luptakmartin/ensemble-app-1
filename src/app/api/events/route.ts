import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { EventRepository, AttendanceRepository } from "@/lib/db/repositories";
import { eventSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filter = request.nextUrl.searchParams.get("filter") || "upcoming";
  const repo = new EventRepository(session.ensembleId);

  const events =
    filter === "past" ? await repo.findPast() : await repo.findUpcoming();

  return NextResponse.json(events);
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
    const data = eventSchema.parse(body);
    const repo = new EventRepository(session.ensembleId);
    const event = await repo.create(data);

    const attendanceRepo = new AttendanceRepository(session.ensembleId);
    await attendanceRepo.bulkCreateForEvent(event.id);

    return NextResponse.json(event, { status: 201 });
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
