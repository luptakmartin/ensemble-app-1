import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { EventRepository, MemberRepository, AttendanceRepository } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const from = fromParam ? new Date(fromParam + "T00:00:00Z") : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  // Make "to" inclusive by advancing to end of day
  let to: Date | undefined;
  if (toParam) {
    to = new Date(toParam + "T00:00:00Z");
    to.setDate(to.getDate() + 1);
  }

  const typeParam = searchParams.get("type");

  const eventRepo = new EventRepository(session.ensembleId);
  const memberRepo = new MemberRepository(session.ensembleId);
  const attendanceRepo = new AttendanceRepository(session.ensembleId);

  const [events, members] = await Promise.all([
    eventRepo.findByDateRange(from, to, typeParam || undefined),
    memberRepo.findAll(),
  ]);

  const eventIds = events.map((e) => e.id);
  const attendance = await attendanceRepo.findByEvents(eventIds);

  return NextResponse.json({ events, members, attendance });
}
