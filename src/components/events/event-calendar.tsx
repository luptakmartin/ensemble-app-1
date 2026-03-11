"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { calendarColorMap } from "./event-type-badge";
import { CalendarEventPopover } from "./calendar-event-popover";
import type { Event } from "@/lib/db/repositories";
import { useRouter } from "@/lib/i18n/routing";

const fcLocaleMap: Record<string, string> = {
  cs: "cs",
  sk: "sk",
  en: "en-gb",
};

export function EventCalendar({
  events,
  canEdit,
}: {
  events: Event[];
  canEdit: boolean;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [popover, setPopover] = useState<{
    event: Event;
    rect: { x: number; y: number };
  } | null>(null);

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    start: new Date(event.date).toISOString().split("T")[0],
    backgroundColor: calendarColorMap[event.type],
    borderColor: calendarColorMap[event.type],
    extendedProps: { event },
  }));

  const handleEventClick = useCallback((info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const rect = info.el.getBoundingClientRect();
    const event = info.event.extendedProps.event as Event;
    setPopover({
      event,
      rect: { x: rect.left, y: rect.bottom + 4 },
    });
  }, []);

  const handleDateClick = useCallback(
    (info: DateClickArg) => {
      if (canEdit) {
        router.push(`/events/new?date=${info.dateStr}`);
      }
    },
    [canEdit, router]
  );

  const handleClosePopover = useCallback(() => {
    setPopover(null);
  }, []);

  return (
    <div data-testid="event-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={fcLocaleMap[locale] || "en-gb"}
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        height="auto"
        firstDay={1}
      />
      {popover && (
        <CalendarEventPopover
          event={popover.event}
          rect={popover.rect}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}
