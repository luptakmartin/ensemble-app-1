"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getAuthService } from "@/lib/services/auth";

export async function signOut(): Promise<void> {
  const authService = getAuthService();
  await authService.signOut();
  const locale = await getLocale();
  redirect(`/${locale}/login`);
}
