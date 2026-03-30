"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberCard } from "./member-card";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { Member } from "@/lib/db/repositories";

const voiceGroups = ["S", "A", "T", "B"] as const;

export function MemberList({
  members,
  isAdmin,
}: {
  members: Member[];
  isAdmin: boolean;
}) {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const [showInvite, setShowInvite] = useState(false);
  const [nameFilter, setNameFilter] = useState("");

  const filterByName = (list: Member[]) =>
    nameFilter
      ? list.filter((m) => m.name.toLowerCase().includes(nameFilter.toLowerCase()))
      : list;

  const filterByGroup = (group: string | null) => {
    const base = group ? members.filter((m) => m.voiceGroup === group) : members;
    return filterByName(base);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("filterPlaceholder")}
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Button onClick={() => setShowInvite(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("invite")}
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t("allGroups")}</TabsTrigger>
          {voiceGroups.map((group) => (
            <TabsTrigger key={group} value={group}>
              {t(`voiceGroups.${group}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {filterByName(members).length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {nameFilter ? tCommon("noResults") : t("noMembers")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filterByName(members).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>

        {voiceGroups.map((group) => {
          const filtered = filterByGroup(group);
          return (
            <TabsContent key={group} value={group}>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  {nameFilter ? tCommon("noResults") : t("noMembers")}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {isAdmin && (
        <InviteMemberDialog
          open={showInvite}
          onOpenChange={setShowInvite}
        />
      )}
    </div>
  );
}
