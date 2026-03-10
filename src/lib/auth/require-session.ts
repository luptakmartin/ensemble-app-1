import { redirect } from "next/navigation";
import { getSessionContext, type SessionContext } from "./session";

export async function requireSession(): Promise<SessionContext> {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  return session;
}
