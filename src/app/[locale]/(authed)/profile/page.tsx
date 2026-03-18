import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { MemberRepository } from "@/lib/db/repositories";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { LogoutButton } from "@/components/profile/logout-button";

export default async function ProfilePage() {
  const session = await requireSession();
  const t = await getTranslations("profile");

  const repo = new MemberRepository(session.ensembleId);
  const member = await repo.findById(session.member.id);

  if (!member) {
    throw new Error("Member not found");
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <div className="space-y-8">
        <ProfileForm member={member} />
        <Separator />
        <ChangePasswordForm />
        <Separator />
        <LogoutButton />
      </div>
    </div>
  );
}
