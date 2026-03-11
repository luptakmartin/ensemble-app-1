import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { CompositionRepository, AttachmentRepository } from "@/lib/db/repositories";
import { attachmentSchema } from "@/lib/validation/schemas";
import { getStorageService } from "@/lib/services/storage";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const compositionRepo = new CompositionRepository(session.ensembleId);
  const composition = await compositionRepo.findById(id);

  if (!composition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const attachmentRepo = new AttachmentRepository();
  const attachments = await attachmentRepo.findByComposition(id);

  return NextResponse.json(attachments);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session.member.roles, ["admin", "director"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const compositionRepo = new CompositionRepository(session.ensembleId);
  const composition = await compositionRepo.findById(id);

  if (!composition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") || "";
  const attachmentRepo = new AttachmentRepository();

  if (contentType.includes("application/json")) {
    // Link mode
    try {
      const body = await request.json();
      const data = attachmentSchema.parse(body);
      const attachment = await attachmentRepo.create({
        compositionId: id,
        type: data.type,
        name: data.name,
        url: data.url,
        isLink: true,
      });
      return NextResponse.json(attachment, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }
  } else {
    // File upload mode
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const type = formData.get("type") as string | null;

    if (!file || !name || !type) {
      return NextResponse.json(
        { error: "Missing file, name, or type" },
        { status: 400 }
      );
    }

    if (type !== "sheet" && type !== "audio") {
      return NextResponse.json(
        { error: "Type must be 'sheet' or 'audio'" },
        { status: 400 }
      );
    }

    const storageService = await getStorageService();
    const uuid = crypto.randomUUID();
    const storagePath = `compositions/${session.ensembleId}/${id}/${uuid}`;
    const result = await storageService.upload("attachments", storagePath, file);

    const attachment = await attachmentRepo.create({
      compositionId: id,
      type,
      name,
      url: result.url,
      isLink: false,
    });

    return NextResponse.json(attachment, { status: 201 });
  }
}
