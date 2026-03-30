"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Grid3x3, Calendar, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard } from "./event-card";
import { EventCalendar } from "./event-calendar";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

type UserAttendanceMap = Record<string, { status: PresenceStatus; note: string | null }>;

type ViewMode = "cards" | "calendar";

export function EventList({
  upcomingEvents,
  pastEvents,
  allEvents,
  canEdit,
  userAttendanceMap,
  currentMemberId,
  compositionCountMap,
}: {
  upcomingEvents: Event[];
  pastEvents: Event[];
  allEvents: Event[];
  canEdit: boolean;
  userAttendanceMap?: UserAttendanceMap;
  currentMemberId?: string;
  compositionCountMap?: Record<string, number>;
}) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const [view, setView] = useState<ViewMode>("cards");
  const [filter, setFilter] = useState("");

  const filterEvents = (events: Event[]) =>
    filter
      ? events.filter((e) => {
          const q = filter.toLowerCase();
          return e.name.toLowerCase().includes(q) || (e.description?.toLowerCase().includes(q) ?? false);
        })
      : events;

  const renderCard = (event: Event) => {
    const attendance = userAttendanceMap?.[event.id];
    return (
      <EventCard
        key={event.id}
        event={event}
        canEdit={canEdit}
        userStatus={attendance?.status}
        userNote={attendance?.note}
        compositionCount={compositionCountMap?.[event.id]}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("filterPlaceholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
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
        <EventCalendar events={allEvents} canEdit={canEdit} currentMemberId={currentMemberId} />
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">{t("upcoming")}</TabsTrigger>
            <TabsTrigger value="past">{t("past")}</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {filterEvents(upcomingEvents).length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                {filter ? tCommon("noResults") : t("noUpcoming")}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filterEvents(upcomingEvents).map(renderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {filterEvents(pastEvents).length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                {filter ? tCommon("noResults") : t("noPast")}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filterEvents(pastEvents).map(renderCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
