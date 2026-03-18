"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/lib/i18n/routing";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { formatTimeRange } from "@/lib/utils/format-time";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EventTypeBadge } from "./event-type-badge";
import type { Event } from "@/lib/db/repositories";
import { toast } from "sonner";

const dateLocales: Record<string, Locale> = { cs, sk, en: enUS };
const dateFormats: Record<string, string> = {
  cs: "EEEE d. MMMM yyyy",
  sk: "EEEE d. MMMM yyyy",
  en: "EEEE, MMMM d, yyyy",
};

export function EventDetail({
  event,
  canEdit,
}: {
  event: Event;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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
        router.push("/events");
      }
    } catch {
      toast.error(t("toast.networkError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/events">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("events.backToEvents")}
        </Link>
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{event.name}</h2>
          <EventTypeBadge type={event.type} />
        </div>

        <div className="space-y-2 text-muted-foreground">
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

        {event.description && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-1">{t("events.description")}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </>
        )}

        {canEdit && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/events/${event.id}/edit`}>
                  {t("events.edit")}
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {t("events.deleteEvent")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("events.deleteEvent")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("events.confirmDelete")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {t("common.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
