"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getAuthService } from "@/lib/services/auth";

export async function signIn(
  email: string,
  password: string
): Promise<{ error?: string }> {
  const authService = getAuthService();

  try {
    await authService.signIn(email, password);
  } catch {
    return { error: "loginError" };
  }

  const locale = await getLocale();
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
