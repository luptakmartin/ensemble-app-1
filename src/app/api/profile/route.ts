import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { MemberRepository } from "@/lib/db/repositories";
import { memberProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = new MemberRepository(session.ensembleId);
  const member = await repo.findById(session.member.id);

  return NextResponse.json(member);
}

export async function PUT(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = memberProfileSchema.parse(body);

    const repo = new MemberRepository(session.ensembleId);
    const member = await repo.update(session.member.id, data);

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
