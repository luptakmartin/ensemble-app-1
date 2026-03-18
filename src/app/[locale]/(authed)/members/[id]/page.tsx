import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/require-session";
import { MemberRepository } from "@/lib/db/repositories";
import { hasRole } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RoleManager } from "@/components/members/role-manager";
import { VoiceGroupEditor } from "@/components/members/voice-group-editor";
import { Link } from "@/lib/i18n/routing";
import { ArrowLeft } from "lucide-react";

type PageParams = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: PageParams) {
  const { id } = await params;
  const session = await requireSession();
  const t = await getTranslations("members");

  const repo = new MemberRepository(session.ensembleId);
  const member = await repo.findById(id);

  if (!member) {
    notFound();
  }

  const isAdmin = hasRole(session.member.roles, ["admin"]);
  const isDirectorOrAdmin = hasRole(session.member.roles, ["admin", "director"]);
  const isSelf = session.member.id === member.id;

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Link
        href="/members"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:underline mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToMembers")}
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">{member.email}</p>
          {member.phone && (
            <p className="text-muted-foreground">{member.phone}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {member.voiceGroup && (
            <Badge variant="secondary">
              {t(`voiceGroups.${member.voiceGroup}`)}
            </Badge>
          )}
          {member.roles.map((role) => (
            <Badge key={role} variant="outline">
              {t(`roles.${role}`)}
            </Badge>
          ))}
        </div>

        {isDirectorOrAdmin && (
          <>
            <Separator />
            <VoiceGroupEditor
              memberId={member.id}
              currentVoiceGroup={member.voiceGroup}
            />
          </>
        )}

        {isAdmin && (
          <>
            <Separator />
            <RoleManager
              memberId={member.id}
              currentRoles={member.roles}
              isSelf={isSelf}
            />
          </>
        )}
      </div>
    </div>
  );
}
