"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "./event-card";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";

export function EventList({
  upcomingEvents,
  pastEvents,
  canEdit,
}: {
  upcomingEvents: Event[];
  pastEvents: Event[];
  canEdit: boolean;
}) {
  const t = useTranslations("events");

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Link>
          </Button>
        </div>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{t("upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("past")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {t("noUpcoming")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} canEdit={canEdit} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastEvents.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {t("noPast")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} canEdit={canEdit} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
