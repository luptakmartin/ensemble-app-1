"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTypeBadge } from "./event-type-badge";
import { PresenceButton } from "@/components/attendance/presence-button";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";

type PresenceStatus = "yes" | "maybe" | "no" | "unset";

const dateLocales: Record<string, Locale> = { cs, sk, en: enUS };
const dateFormats: Record<string, string> = {
  cs: "d. MMMM yyyy",
  sk: "d. MMMM yyyy",
  en: "MMMM d, yyyy",
};

export function CalendarEventPopover({
  event,
  rect,
  onClose,
}: {
  event: Event;
  rect: { x: number; y: number };
  onClose: () => void;
}) {
  const t = useTranslations("events");
  const tPresence = useTranslations("presence");
  const locale = useLocale();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PresenceStatus>("unset");
  const [loading, setLoading] = useState(true);

  const formattedDate = format(
    new Date(event.date),
    dateFormats[locale] || dateFormats.en,
    { locale: dateLocales[locale] || dateLocales.en }
  );

  useEffect(() => {
    fetch(`/api/events/${event.id}/attendance`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) setStatus(data.status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [event.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleStatusChange = async (newStatus: PresenceStatus) => {
    setStatus(newStatus);
    await fetch(`/api/events/${event.id}/attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{ left: rect.x, top: rect.y }}
      data-testid="calendar-event-popover"
    >
      <Card className="w-72 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/events/${event.id}`}>
              <CardTitle className="text-base hover:underline">
                {event.name}
              </CardTitle>
            </Link>
            <EventTypeBadge type={event.type} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.place}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{tPresence("yourStatus")}</p>
            <PresenceButton
              status={status}
              onStatusChange={handleStatusChange}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
