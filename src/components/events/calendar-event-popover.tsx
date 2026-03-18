"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTypeBadge } from "./event-type-badge";
import { PresenceButton } from "@/components/attendance/presence-button";
import { PresenceNote } from "@/components/attendance/presence-note";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";
import { toast } from "sonner";
import { formatTimeRange } from "@/lib/utils/format-time";

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
  currentMemberId,
}: {
  event: Event;
  rect: { x: number; y: number };
  onClose: () => void;
  currentMemberId?: string;
}) {
  const tPresence = useTranslations("presence");
  const tToast = useTranslations("toast");
  const locale = useLocale();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PresenceStatus>("unset");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ left: rect.x, top: rect.y });

  const formattedDate = format(
    new Date(event.date),
    dateFormats[locale] || dateFormats.en,
    { locale: dateLocales[locale] || dateLocales.en }
  );

  // Fetch attendance and find current user's record
  useEffect(() => {
    fetch(`/api/events/${event.id}/attendance`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const myRecord = currentMemberId
            ? data.find((a: { memberId: string }) => a.memberId === currentMemberId)
            : null;
          if (myRecord) {
            setStatus(myRecord.status);
            setNote(myRecord.note ?? null);
          }
        } else if (data.status) {
          setStatus(data.status);
          setNote(data.note ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [event.id, currentMemberId]);

  // B2: Fix popover positioning
  const adjustPosition = useCallback(() => {
    if (!popoverRef.current) return;
    const el = popoverRef.current;
    const popoverRect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { left, top } = { left: rect.x, top: rect.y };

    if (vw < 640) {
      // Mobile: center horizontally
      left = Math.max(8, (vw - popoverRect.width) / 2);
      if (top + popoverRect.height > vh - 8) {
        top = Math.max(8, vh - popoverRect.height - 8);
      }
    } else {
      if (left + popoverRect.width > vw - 8) {
        left = vw - popoverRect.width - 8;
      }
      if (top + popoverRect.height > vh - 8) {
        top = rect.y - popoverRect.height - 4;
      }
    }

    setPosition({ left: Math.max(8, left), top: Math.max(8, top) });
  }, [rect.x, rect.y]);

  useEffect(() => {
    // Run after first render
    requestAnimationFrame(adjustPosition);
  }, [adjustPosition]);

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
    const previous = status;
    setStatus(newStatus);
    try {
      const res = await fetch(`/api/events/${event.id}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setStatus(previous);
        toast.error(tToast("error"));
      }
    } catch {
      setStatus(previous);
      toast.error(tToast("networkError"));
    }
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{ left: position.left, top: position.top }}
      data-testid="calendar-event-popover"
    >
      <Card className="w-80 shadow-lg">
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
              <span>{formatTimeRange(event.time, event.timeTo)}</span>
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
            <div className="mt-1">
              <PresenceNote
                eventId={event.id}
                note={note}
                onNoteChange={setNote}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
