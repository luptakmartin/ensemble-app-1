import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionRepository, AttachmentRepository } from "@/lib/db/repositories";
import { getStorageService } from "@/lib/services/storage";
import { attachmentUpdateSchema } from "@/lib/validation/schemas";

type RouteParams = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, attachmentId } = await params;

  const compositionRepo = new CompositionRepository(session.ensembleId);
  const composition = await compositionRepo.findById(id);

  if (!composition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const attachmentRepo = new AttachmentRepository();
  const attachment = await attachmentRepo.findById(attachmentId);

  if (!attachment || attachment.compositionId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Clean up storage for uploaded files
  if (!attachment.isLink) {
    try {
      const storageService = await getStorageService();
      // Extract path from URL — the path after the bucket name
      const url = new URL(attachment.url);
      const pathParts = url.pathname.split("/storage/v1/object/public/attachments/");
      if (pathParts[1]) {
        await storageService.delete("attachments", [decodeURIComponent(pathParts[1])]);
      }
    } catch {
      // Log but don't fail the deletion if storage cleanup fails
      console.error("Failed to clean up storage for attachment", attachmentId);
    }
  }

  await attachmentRepo.delete(attachmentId);

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, attachmentId } = await params;

  const compositionRepo = new CompositionRepository(session.ensembleId);
  const composition = await compositionRepo.findById(id);

  if (!composition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const attachmentRepo = new AttachmentRepository();
  const attachment = await attachmentRepo.findById(attachmentId);

  if (!attachment || attachment.compositionId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = attachmentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await attachmentRepo.update(attachmentId, {
    name: parsed.data.name,
    type: parsed.data.type,
  });

  return NextResponse.json(updated);
}
