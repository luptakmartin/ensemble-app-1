"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin, MoreVertical, ChevronDown, ChevronUp, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  cs: "EEEE d. MMMM yyyy",
  sk: "EEEE d. MMMM yyyy",
  en: "EEEE, MMMM d, yyyy",
};

const statusColorMap: Record<PresenceStatus, string> = {
  yes: "bg-green-100 text-green-800",
  maybe: "bg-blue-100 text-blue-800",
  no: "bg-red-100 text-red-800",
  unset: "bg-gray-100 text-gray-800",
};

export function EventCard({
  event,
  canEdit,
  userStatus: initialStatus,
  userNote: initialNote,
  compositionCount,
}: {
  event: Event;
  canEdit: boolean;
  userStatus?: PresenceStatus;
  userNote?: string | null;
  compositionCount?: number;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState<PresenceStatus>(initialStatus ?? "unset");
  const [note, setNote] = useState<string | null>(initialNote ?? null);
  const [rsvpOpen, setRsvpOpen] = useState(false);

  const formattedDate = format(new Date(event.date), dateFormats[locale] || dateFormats.en, {
    locale: dateLocales[locale] || dateLocales.en,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || t("toast.error"));
      } else {
        toast.success(t("toast.deleteSuccess"));
        router.refresh();
      }
    } catch {
      toast.error(t("toast.networkError"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
        toast.error(t("toast.error"));
      }
    } catch {
      setStatus(previous);
      toast.error(t("toast.networkError"));
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <CardTitle className="text-lg hover:underline">
              {event.name}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-2">
            <EventTypeBadge type={event.type} />
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      {t("events.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    {t("events.deleteEvent")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/events/${event.id}`}>
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
          </Link>
          {compositionCount != null && compositionCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Music className="h-4 w-4" />
              <span>{compositionCount} {t("events.compositionsScheduled")}</span>
            </div>
          )}
          {initialStatus !== undefined && (
            <div className="mt-3 pt-3 border-t">
              <button
                type="button"
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${statusColorMap[status]}`}
                onClick={() => setRsvpOpen(!rsvpOpen)}
              >
                RSVP: {t(`presence.${status}`)}
                {rsvpOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {rsvpOpen && (
                <div className="mt-2 space-y-1">
                  <PresenceButton
                    status={status}
                    onStatusChange={handleStatusChange}
                  />
                  <PresenceNote
                    eventId={event.id}
                    note={note}
                    onNoteChange={setNote}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("events.deleteEvent")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("events.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
