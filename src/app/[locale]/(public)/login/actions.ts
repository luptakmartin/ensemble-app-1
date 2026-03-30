"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { getAuthService } from "@/lib/services/auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { members } from "@/lib/db/schema";

export async function signIn(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const authService = getAuthService();

  let session;
  try {
    session = await authService.signIn(email, password);
  } catch {
    return { error: "loginError" };
  }

  // Look up the member's preferred locale
  let locale = await getLocale();
  try {
    const [member] = await db
      .select({ preferredLocale: members.preferredLocale })
      .from(members)
      .where(eq(members.userId, session.user.id))
      .limit(1);

    if (member?.preferredLocale) {
      locale = member.preferredLocale;
    }
  } catch {
    // Fall back to current locale if DB query fails
  }

  // Set the NEXT_LOCALE cookie so next-intl middleware remembers the preference
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });

  redirect(`/${locale}/events`);
}

export async function resetPasswordAction(
  email: string
): Promise<{ success: boolean }> {
  const authService = getAuthService();

  try {
    await authService.resetPassword(email);
  } catch {
    // Don't reveal whether the email exists
  }

  return { success: true };
}
