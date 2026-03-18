"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { Link } from "@/lib/i18n/routing";
import type { Member } from "@/lib/db/repositories";

export function MemberCard({ member }: { member: Member }) {
  const t = useTranslations("members");

  return (
    <Card>
      <CardHeader className="pb-2">
        <Link href={`/members/${member.id}`} className="flex items-center gap-3">
          <AvatarDisplay
            name={member.name}
            imageUrl={member.profilePicture}
            size="md"
          />
          <CardTitle className="text-lg hover:underline">
            {member.name}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={`/members/${member.id}`}>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <div className="flex flex-wrap gap-1">
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
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
