import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSessionContext, type SessionContext } from "./session";

export async function requireSession(): Promise<SessionContext> {
  const session = await getSessionContext();

  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  return session;
}
