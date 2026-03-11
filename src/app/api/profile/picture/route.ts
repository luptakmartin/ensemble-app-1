import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { MemberRepository } from "@/lib/db/repositories";
import { getStorageService } from "@/lib/services/storage";
import crypto from "crypto";

export async function PUT(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const storageService = await getStorageService();
  const path = `avatars/${session.ensembleId}/${session.member.id}/${crypto.randomUUID()}`;
  const result = await storageService.upload("attachments", path, file);

  const repo = new MemberRepository(session.ensembleId);

  // Delete old picture if exists
  if (session.member.profilePicture) {
    try {
      await storageService.delete("attachments", [session.member.profilePicture]);
    } catch {
      // Ignore deletion errors for old pictures
    }
  }

  const member = await repo.update(session.member.id, {
    profilePicture: result.url,
  });

  return NextResponse.json(member);
}
