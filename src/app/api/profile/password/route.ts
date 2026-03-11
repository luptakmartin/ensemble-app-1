import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { getAuthService } from "@/lib/services/auth";
import { changePasswordSchema } from "@/lib/validation/schemas";

export async function PUT(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    const authService = getAuthService();

    // Verify current password
    try {
      await authService.signIn(session.member.email, data.currentPassword);
    } catch {
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 400 }
      );
    }

    await authService.updatePassword(data.newPassword);

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
