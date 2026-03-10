import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSessionContext } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { signOut } from "./actions";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionContext();

  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen">
      <Sidebar roles={session.member.roles} signOutAction={signOut} />
      <main className="md:pl-60 pb-16 md:pb-0">{children}</main>
      <MobileNav roles={session.member.roles} />
    </div>
  );
}
