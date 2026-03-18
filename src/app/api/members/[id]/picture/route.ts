import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { MemberRepository } from "@/lib/db/repositories";
import { getStorageService } from "@/lib/services/storage";
import crypto from "crypto";

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const storageService = await getStorageService();
  const path = `avatars/${session.ensembleId}/${id}/${crypto.randomUUID()}`;
  const result = await storageService.upload("attachments", path, file);

  // Delete old picture if exists
  if (member.profilePicture) {
    try {
      await storageService.delete("attachments", [member.profilePicture]);
    } catch {
      // Ignore deletion errors for old pictures
    }
  }

  const updated = await repo.update(id, { profilePicture: result.url });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  if (member.profilePicture) {
    const storageService = await getStorageService();
    try {
      await storageService.delete("attachments", [member.profilePicture]);
    } catch {
      // Ignore deletion errors
    }
  }

  const updated = await repo.update(id, { profilePicture: null });
  return NextResponse.json(updated);
}
