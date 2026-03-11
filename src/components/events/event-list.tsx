"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Grid3x3, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "./event-card";
import { EventCalendar } from "./event-calendar";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";

type ViewMode = "cards" | "calendar";

export function EventList({
  upcomingEvents,
  pastEvents,
  allEvents,
  canEdit,
}: {
  upcomingEvents: Event[];
  pastEvents: Event[];
  allEvents: Event[];
  canEdit: boolean;
}) {
  const t = useTranslations("events");
  const [view, setView] = useState<ViewMode>("cards");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-md border p-1">
          <Button
            variant={view === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("cards")}
            aria-label={t("cardView")}
          >
            <Grid3x3 className="h-4 w-4 mr-1" />
            {t("cardView")}
          </Button>
          <Button
            variant={view === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("calendar")}
            aria-label={t("calendarView")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t("calendarView")}
          </Button>
        </div>

        {canEdit && (
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Link>
          </Button>
        )}
      </div>

      {view === "calendar" ? (
        <EventCalendar events={allEvents} canEdit={canEdit} />
      ) : (
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
      )}
    </div>
  );
}
